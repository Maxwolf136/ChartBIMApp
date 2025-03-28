import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import groupings from "./Sections/Groupings";
import { ModalDataUI } from "../../bim-components/ChatGpt/src/user-interface";
import { ChartUI } from "../../bim-components/ChartData/src/user-interface";
export default (components: OBC.Components) => {
  const [modelsList] = CUI.tables.modelsList({ components });
  const [relationsTree] = CUI.tables.relationsTree({
    components,
    models: [],
    hoverHighlighterName: "hover",
    selectHighlighterName: "select",
  });
  relationsTree.preserveStructureOnFilter = true;

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    relationsTree.queryString = input.value;
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Loaded Models" icon="mage:box-3d-fill">
          ${modelsList}
        </bim-panel-section>
        
        <bim-panel-section label="AI / CHART" icon="mage:box-3d-fill">
        
        
        ${ModalDataUI(components)}
        ${ChartUI(components)}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
