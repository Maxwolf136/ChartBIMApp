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
  Tooltip,
  DoughnutController,
  ArcElement
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale,Tooltip,DoughnutController,ArcElement);



export  function ChartUI(components: OBC.Components){
  const chartClass = components.get(ChartData);
  const fragmdntManager = components.get(OBC.FragmentsManager);
  const hider = components.get(OBC.Hider);
  const OptionsData = {
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
  }
}
  
  let chart: Chart | null;

  const initialize = ()=>{
    setTimeout(async ()=>{
      
      if(chart) chart.destroy();
      const canvas = document.getElementById("myChart") as HTMLCanvasElement;
      var data = await chartClass.getAllEntitiesOfType();
      const chartDataset = chartClass.chartData(data, 'bar');
      
      const fullChartData = {...chartDataset, ...OptionsData};

      if(!canvas) return;
      const ctx = canvas.getContext("2d");
      if(!ctx) return;
      
    
      chart =new Chart(ctx,fullChartData);
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
          //console.log("fragmentIdMap: ", fragmentMapOfBarIds);
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

  const dropDownOnClick = async (e: Event)=>{
    const btn = e.target as BUI.Dropdown;
    const panelSection = btn.closest("bim-panel-section");
    const chartType= panelSection?.value.type[0];
    if(!chartType){
      alert("Select option from dropdown");
      return;
    }
    //console.log(chartType);
    const levelsData = await chartClass.getPropertiesOfSpecificLevel();
    if(chartType==="bar"){
      initialize();
    }else if(chartType==="doughnut"){
      const chartData = chartClass.chartData(levelsData,'doughnut');
    if(chart) chart.destroy();
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    canvas.style.maxWidth = "300px";
    canvas.style.maxHeight = "300px";
    canvas.style.display = "flex";
    canvas.style.justifyContent = "center";
    canvas.style.alignItems = "center";
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    //const legensOPtions = {legend:{display:false}};
    const modifyOPtions = {
      ...OptionsData, 
      options:{
        ...OptionsData.options,
        //responsive:true,
        //maintainAspectRatio: false, // Pozwala na lepszą kontrolę rozmiaru
        //cutout: "60%", // Zmniejsza środek wykresu, co optycznie go pomniejsza
        layout:{
          padding:20, // Zwiększa odstępy wokół wykresu
        },
        scales:{
          x:{
            display:false,
          },
          y:{
            display:false,
          }
        },
        plugins:{
          ...OptionsData.options.plugins, 
          legend:{
            display:false}
          }
        }
      }
    const fullyChartData = {...chartData, ...modifyOPtions};
    chart =new Chart(ctx, fullyChartData);
    hider.set(true);

    canvas.onclick = function(event){
      hider.set(true);
      let activePoints = chart?.getElementsAtEventForMode(event, "nearest", {intersect: true}, false);
      if(activePoints && activePoints.length>0){
        var index = activePoints[0].index; // Indeks klikniętego słupka
        var label = chart?.data.labels[index]; // Etykieta klikniętego słupka
        var value = chart?.data.datasets[0].data[index]; // Wartość klikniętego słupka

        var clickedBarData = levelsData.filter(item=>item.elementType===label)[0];
        const models = fragmdntManager.groups;
        for(const [modelId, model] of models){
          const fragmentIdMapFromSelectedChartELement = model.getFragmentMap(clickedBarData.expressIds);
          hider.isolate(fragmentIdMapFromSelectedChartELement);
        }
      }

    }
    }
    
  }

  
  //initialize();

  return BUI.html`
    <bim-panel-section label="Charts" fixed style="display:flex; justify-content:center; align-items: center;">
      <bim-button @click=${initialize} label="RESTART CHART" icon="mi:add"></bim-button>
      <bim-dropdown name="type" @change=${dropDownOnClick}>
        <bim-option label="Bar Chart By Type" value="bar"></bim-option>
        <bim-option label="Doughnut Chart By Level" value ="doughnut"></bim-option>
      </bim-dropdown>
      <canvas id="myChart" width="300" height="200"></canvas>
    </bim-panel-section>
  `
}