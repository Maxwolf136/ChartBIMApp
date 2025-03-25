import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import { ChartData } from ".."
import {  ChartType, elements, plugins } from "chart.js";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale,Tooltip);

export  function ChartUI(components: OBC.Components){
  const chartData = components.get(ChartData);
  const fragmdntManager = components.get(OBC.FragmentsManager);
  const hider = components.get(OBC.Hider);
  
  let chart: Chart | null;

  const initialize = ()=>{
    setTimeout(async ()=>{
      
      if(chart) chart.destroy();
      const canvas = document.getElementById("myChart") as HTMLCanvasElement;
      var data = await chartData.getAllEntitiesOfType();
      const chartDataset = chartData.barChart(data)
      const opt = {
        options:{
          elements: {
            bar: {
                borderWidth: 5,
                borderRadius: 5
            }
          },
          plugins:{
            tooltip:{
              enabled: true,
              mode:"index",
              intersect:false,
            }
          },

          onclick: (event,elements)=>{
            console.log("Elements clicked: ", elements);
            const defaultColors = [
              "rgba(255, 0, 0, 0.7)",    // Czerwony
              "rgba(0, 150, 255, 0.7)",  // Niebieski
              "rgba(0, 255, 0, 0.7)",    // Zielony
            ];
          const clickedColor = "rgba(255, 255, 0, 0.7)"; // Żółty po kliknięciu
      
            if(elements.length>0){
              const index = elements[0].index as number;
              const currentColors = chart?.data.datasets[0].backgroundColor;
              if(!currentColors) return;
              currentColors[index] = currentColors[index] === clickedColor ? defaultColors[index] : clickedColor;
              chart?.update();
            }
          }
      }
    }
    const test = {...chartDataset, ...opt};
    
    

      if(!canvas) return;
      const ctx = canvas.getContext("2d");
      if(!ctx) return;
      
    
    chart =new Chart(ctx,test);
    hider.set(true);

    canvas.onclick = function(event){
      hider.set(true);
      let activePoints = chart?.getElementsAtEventForMode(event, "nearest", {intersect: true}, false);
      if(activePoints && activePoints.length>0){
        var index = activePoints[0].index; // Indeks klikniętego słupka
        var label = chart?.data.labels[index]; // Etykieta klikniętego słupka
        var value = chart?.data.datasets[0].data[index]; // Wartość klikniętego słupka

        var clickedBarData = data.filter(item=>item.elementType===label)[0];
        const models =fragmdntManager.groups;
        for(const [id, model] of models){
          const fragmentMapOfBarIds =model.getFragmentMap(clickedBarData.expressIds);
          hider.isolate(fragmentMapOfBarIds);
          console.log("fragmentIdMap: ", fragmentMapOfBarIds);
        }
        //console.log("clicked bar: ",clickedBarData);

        //alert('Kliknięto słupek: ' + label + ' o wartości: ' + value);
        const defaultColors = [
          "rgba(255, 0, 0, 0.7)",    // Czerwony
          "rgba(0, 150, 255, 0.7)",  // Niebieski
          "rgba(0, 255, 0, 0.7)",    // Zielony
        ];
      const clickedColor = "rgba(255, 255, 0, 0.7)"; // Żółty po kliknięciu
      const currentColors = chart?.data.datasets[0].backgroundColor;

      for(let i =0; i<defaultColors.length; i++){
        currentColors[i] = defaultColors[i];
      }

      if(!currentColors) return;
      currentColors[index] = currentColors[index] === clickedColor ? defaultColors[index] : clickedColor;
      chart?.update();
      }
    }

    },0)
  }

  

  //initialize();

  return BUI.html`
    <bim-panel-section label="Charts" fixed>
      <bim-button @click=${initialize} label="CHART" icon="mi:add"></bim-button>
      <canvas id="myChart" width="400" height="200"></canvas>
    </bim-panel-section>
  `
}