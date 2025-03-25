import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc"
import Chart, { ChartType } from "chart.js/auto";
import { label } from "three/examples/jsm/nodes/Nodes.js";

export interface BarData {
  expressIds: number[],
  elementType:string,
  color:string,
}

export interface BarDataset{
  type:string,
  data:{
    labels: string[],
    datasets:[{
      label:string,
      data: number[],
      backgroundColor: string[],
      borderWidth: number[],
      borderRadius: number[],
      borderColor: string[]
    }]
  }
}

export class ChartData extends OBC.Component {
  enabled: boolean = true;
  static uuid = OBC.UUID.create();
  fragmentGroup = this.components.get(OBC.FragmentsManager);

  constructor(components: OBC.Components){
    super(components);
    components.add(ChartData.uuid, this);
  }

  getPropertiesOfSpecificType = async (typeNumber:number, elementTypeName:string, color:string)=>{
    
    let bar : BarData = {expressIds : [], elementType:elementTypeName, color}
    for(var [id,model] of this.fragmentGroup.groups){
      const searchType = await model.getAllPropertiesOfType(typeNumber);
      if(!searchType) continue;
      
      for(var [expressId, typeDetails] of Object.entries(searchType)){
        bar.expressIds.push(parseInt(expressId,10));
        
      }
    }
    return bar;
    
  }

  getAllEntitiesOfType = async ()=>{
    let data: BarData[] = [];
    for(var [id,model] of this.fragmentGroup.groups){
      const walls = await this.getPropertiesOfSpecificType(WEBIFC.IFCWALL, "IfcWall","rgba(255, 0, 0, 0.5)");
      const slabs = await this.getPropertiesOfSpecificType(WEBIFC.IFCSLAB, "IfcSlab","rgba(0, 150, 255, 0.5)");
      const beams = await this.getPropertiesOfSpecificType(WEBIFC.IFCBEAM,"IfcBeam","rgba(0, 255, 0, 0.5)");
      data.push(walls);
      data.push(slabs);
      data.push(beams);
    }
    return data;
  }

  barChart = (chartData:BarData[])=>{

      let singleDataset : BarDataset = {
        type:'bar' as ChartType,
        data:{
          labels:chartData.map(item=>{return item.elementType}),
          datasets:[
            {
              label:"Quantity",
              data: chartData.map(item=>{return item.expressIds.length}),
              backgroundColor: chartData.map(item=>{return item.color}),
              borderWidth: [2,2,2],
              borderRadius: [8,8,8],
              borderColor: [ "darkred", "darkblue", "darkgreen"]
            }
          ]
        }
      }
    return singleDataset;
    
  }

  

}