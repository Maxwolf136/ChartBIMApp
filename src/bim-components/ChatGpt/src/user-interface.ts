import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import { ChatGpt } from "..";

export function ModalDataUI(components: OBC.Components) {
  const modelData = components.get(ChatGpt);
  const textArea = document.createElement("textarea");
  textArea.setAttribute("rows", "10");
  textArea.setAttribute("cols", "10");
  textArea.style.backgroundColor = "rgb(56, 46, 56)";
  textArea.style.color = "white";

  const onAddClick = async (e: Event) => {
    const btn = e.target as BUI.Button;
    const panelSection = btn.closest("bim-panel-section");
    const querry = panelSection?.value.name;
    console.log("onAdd: ", querry);
    if (!modelData.fileData) {
      alert("No file data, cant answear");
      return;
    }
    const querryResponse = await modelData.getQuerry({
      message: querry,
      fileData: modelData.fileData,
    });
    textArea.innerText = querryResponse.choices[0].message.content;
    // textArea.append(querryResponse.choices[0].message.content);
  };

  const resetTextInputs = async () => {
    textArea.innerText = "";
    const inputQuerry = document.getElementById(
      "querryDataField",
    ) as BUI.TextInput;
    if (inputQuerry as BUI.TextInput) inputQuerry.value = "";
    const fragmentManager = components.get(OBC.FragmentsManager);
    for (const [_, model] of fragmentManager.groups) {
      const modelTypeWall = await model.getAllPropertiesOfType(
        WEBIFC.IFCWALLSTANDARDCASE,
      );
      console.log("All Walls type: ", modelTypeWall);
    }
  };

  return BUI.html`
    <bim-toolbar-section label="AI Panel" icon="material-symbols:inventory" style="width:100%">
      <div style="display: flex; flex-direction:column; gap: 0.375rem; min-width:350px">
        <bim-panel-section  fixed>
          <bim-text-input name="name" id = "querryDataField" label = "Write Question" vertical></bim-text-input>
          ${textArea}
          <div style="display: flex; gap:0.375rem">
            <bim-button name="querry" label="Querry" icon="bx:show-alt" @click=${(e: Event) => onAddClick(e)}></bim-button>
            <bim-button label="Reset" icon="bx:show-alt" @click=${() => resetTextInputs()}></bim-button>
          </div>
        </bim-panel-section>
      </div>

      
      </bim-toolbar-section>
  `;
}
