import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import { LoadIfcFile } from ".."
import { loadAsync } from "jszip";

export function LoadIFCUI(components:OBC.Components, world: OBC.SimpleWorld){
  
  const lodLogic = components.get(LoadIfcFile);

  const fileInput = document.createElement("input");
  fileInput.type="file";
  fileInput.accept = ".ifc";
  fileInput.style.display="none";


  const onAddClick = async (e : Event)=>{
    console.log("event: "+e);
    fileInput.click();
  }

  fileInput.addEventListener("change", async ()=>{
    const file = fileInput.files?.[0];
    if(!file) return;
    await lodLogic.loadFile(file, world);
  })

  return BUI.html`
    <bim-button @click=${onAddClick} label="Add" icon="mi:add"></bim-button>
  `
}