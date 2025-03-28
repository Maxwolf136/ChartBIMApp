import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { ChatGpt } from "../ChatGpt";
import * as WEBIFC from "web-ifc"
import { FragmentsGroup } from "@thatopen/fragments";


type IfcFileData = {
  fileAsString:string,
}

export class LoadIfcFile extends OBC.Component {
  enabled: boolean = true;
  static uuid = OBC.UUID.create();
  gpt : ChatGpt;

  constructor(components: OBC.Components){
    super(components);
    components.add(LoadIfcFile.uuid, this);
    this.gpt = components.get(ChatGpt);
  }

  AddIfcFileDataToGenerallString = async ( model: FragmentsGroup, type: number, backupType?: number)=>{
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    let generallString: string = "";
    let wallsData = await model.getAllPropertiesOfType(type);
    if(!wallsData && backupType) wallsData = await model.getAllPropertiesOfType(backupType);
    if(wallsData==null || Object.keys(wallsData).length==0) return;
    console.log("Numbers of difrent material: ",  Object.keys(wallsData).length);
    console.log("Waff prop: ", await model.getAllPropertiesOfType(type));
    for(const [expressId, propeties] of Object.entries(wallsData)){
      //console.log("expressId: ", expressId);
      //console.log("prop: ", propeties);
      generallString += JSON.stringify(propeties); //adding each item we want to the file
      const levelOfThisWall = indexer.getEntitiesWithRelation(model, "ContainsElements", parseInt(expressId));
      //console.log("entityRelations: ", indexer.getEntityRelations(model,parseInt(expressId),"IsDefinedBy"));
      for(var propOfWall of levelOfThisWall){
        const property = await model.getProperties(propOfWall);
        console.log("Property: ", property);
        console.log("Property Key: ", Object.keys(property));
        if(property.type === WEBIFC.IFCBUILDINGSTOREY){
            generallString+= JSON.stringify(property); //adding each level to the file
        }
        
      }

      const propertiesRelations = indexer.getEntityRelations(model,parseInt(expressId),"IsDefinedBy");
      for(const relID of propertiesRelations){
        const relatedEntity =await model.getProperties(relID);
        if(!relatedEntity) continue;
        if(relatedEntity.type === WEBIFC.IFCPROPERTYSET || relatedEntity.type === WEBIFC.IFCELEMENTQUANTITY){
          generallString+= JSON.stringify(relatedEntity);
        }
      }

      
    }
    return generallString;
    console.log("In method string length: ", generallString.length);
    //return generallString;
  }

  async loadFile(file : File | null, world:OBC.SimpleWorld){
    const fragmentLoader = this.components.get(OBC.IfcLoader);
    const gpt = this.components.get(ChatGpt);
    
    if(file ===null){
      alert("Please select ifc file");
      return;
    }
    const reader = new FileReader();
    let fileCOntent : string = ""
    reader.onload = function(event){
      const myData = event.target?.result;
      if(typeof myData ==="string"){
        fileCOntent = myData;
        gpt.fileData = myData;
        //console.log("fileCOntent from LoadIfc: ", fileCOntent);
      }

    }
    reader.readAsText(file);
    //this.gpt.fileData = fileCOntent;

    const fileAsArray = await file.arrayBuffer();
    const buffer = new Uint8Array(fileAsArray);
    const model = await fragmentLoader.load(buffer);
    model.name = "example";
    console.log("MODEL: ", model);
    var ifcContent:IfcFileData = {fileAsString:""};
    //const wall = JSON.stringify(await this.AddIfcFileDataToGenerallString(model,WEBIFC.IFCWALL, WEBIFC.IFCWALLSTANDARDCASE));
    //const slab = JSON.stringify(await this.AddIfcFileDataToGenerallString(model, WEBIFC.IFCSLAB));
    //const beam = JSON.stringify(await this.AddIfcFileDataToGenerallString(model, WEBIFC.IFCBEAM));
    const material = await this.AddIfcFileDataToGenerallString(model, WEBIFC.IFCMATERIAL);
    //ifcContent.fileAsString +=wall;
    //ifcContent.fileAsString+=slab;
    //ifcContent.fileAsString+=wall;
    //ifcContent.fileAsString+=beam;
    //gpt.fileData = ifcContent.fileAsString;
    console.log("MATERIAL: ", material);
    
    //console.log("Wall indexer: ", indexer.getEntitiesWithRelation(model, "IsDefinedBy",2586));

    console.log("ifc you need: ", ifcContent.fileAsString);
    world.scene.three.add(model);

  }
  

}