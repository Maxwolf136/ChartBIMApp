import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { ChatGpt } from "../ChatGpt";



export class LoadIfcFile extends OBC.Component {
  enabled: boolean = true;
  static uuid = OBC.UUID.create();
  gpt : ChatGpt;

  constructor(components: OBC.Components){
    super(components);
    components.add(LoadIfcFile.uuid, this);
    this.gpt = components.get(ChatGpt);
  }

  async loadFile(file : File | null, world:OBC.SimpleWorld){
    const fragmentLoader = this.components.get(OBC.IfcLoader);
    const test = this.components.get(ChatGpt);
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
        test.fileData = myData;
        console.log("fileCOntent from LoadIfc: ", fileCOntent);
      }

    }
    reader.readAsText(file);
    //this.gpt.fileData = fileCOntent;

    const fileAsArray = await file.arrayBuffer();
    const buffer = new Uint8Array(fileAsArray);
    const model = await fragmentLoader.load(buffer);
    model.name = "example";
    console.log("MODEL: ", model);
    
    world.scene.three.add(model);

  }
  

}