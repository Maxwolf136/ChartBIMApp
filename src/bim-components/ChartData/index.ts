import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import Chart, { ChartType } from "chart.js/auto";
import { label } from "three/examples/jsm/nodes/Nodes.js";

export interface ChartData {
  expressIds: number[];
  elementType: string;
  color: string;
}

export interface BarDataset {
  type: string;
  data: {
    labels: string[];
    datasets: [
      {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderWidth: number[];
        borderRadius: number[];
        borderColor: string[];
      },
    ];
  };
}

export class ChartData extends OBC.Component {
  enabled: boolean = true;
  static uuid = OBC.UUID.create();
  fragmentGroup = this.components.get(OBC.FragmentsManager);

  constructor(components: OBC.Components) {
    super(components);
    components.add(ChartData.uuid, this);
  }

  generateUniqueRGB = (usedColors: Set<string>) => {
    let color;
    do {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      color = `rgb(${r}, ${g}, ${b})`;
    } while (usedColors.has(color)); // Sprawdzanie unikalności

    usedColors.add(color);
    return color;
  };

  getPropertiesOfSpecificLevel = async () => {
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const usedColors = new Set<string>();
    const levelsData: ChartData[] = [];
    for (const [_, model] of this.fragmentGroup.groups) {
      console.log("Model: ", model);
      const levelOfModel = await model.getAllPropertiesOfType(
        // test
        WEBIFC.IFCROADPART,
      );
      if (!levelOfModel) continue;
      console.log("Levels:", levelOfModel);

      for (const [expressId, properties] of Object.entries(levelOfModel)) {
        const pieData: ChartData = {
          expressIds: [],
          elementType: properties.Name.value,
          color: this.generateUniqueRGB(usedColors),
        };
        const expressIdAsNUmber = parseInt(expressId) as number;
        if (typeof expressIdAsNUmber !== "number") continue;
        const allElementInThisLevel = indexer.getEntitiesWithRelation(
          model,
          "ContainedInStructure",
          expressIdAsNUmber,
        );
        console.log("Elements in level: ", allElementInThisLevel);
        allElementInThisLevel.forEach((item) => pieData.expressIds.push(item));
        levelsData.push(pieData);
      }
    }
    console.log("LevelsData: ", levelsData);
    return levelsData;
  };

  getPropertiesOfSpecificRoad = async () => {
    const indexer = this.components.get(OBC.IfcRelationsIndexer);
    const usedColors = new Set<string>();
    const roadPartData: ChartData[] = [];

    for (const [_, model] of this.fragmentGroup.groups) {
      console.log("Model: ", model);
      const roadOfModel = await model.getAllPropertiesOfType(
        WEBIFC.IFCROADPART,
      );
      if (!roadOfModel) continue;
      console.log("RoadPart:", roadOfModel);
// test235 med detta så att jag får en GIT hostorik

      for (const [expressId, properties] of Object.entries(roadOfModel)) {
        const pieData: ChartData = {
          expressIds: [],
          elementType: properties.Name.value,
          color: this.generateUniqueRGB(usedColors),
        };
        const expressIdAsNUmber = parseInt(expressId) as number;
        if (typeof expressIdAsNUmber !== "number") continue;
        const allElementRoadPart = indexer.getEntitiesWithRelation(
          model,
          "ContainedInStructure",
          expressIdAsNUmber,
        );
        console.log("Elements in level: ", allElementRoadPart);
        allElementRoadPart.forEach((item) => pieData.expressIds.push(item));
        roadPartData.push(pieData);
      }
    }
    console.log("LevelsData: ", roadPartData);
    return roadPartData;
  };

  getPropertiesOfSpecificType = async (
    typeNumber: number,
    elementTypeName: string,
    color: string,
  ) => {
    const bar: ChartData = {
      expressIds: [],
      elementType: elementTypeName,
      color,
    };
    for (const [id, model] of this.fragmentGroup.groups) {
      const searchType = await model.getAllPropertiesOfType(typeNumber);
      if (!searchType) continue;

      for (const [expressId, properties] of Object.entries(searchType)) {
        bar.expressIds.push(parseInt(expressId, 10));
      }
    }
    return bar;
  };

  circleChart = async (data: ChartData[]) => {};

  getAllEntitiesOfType = async () => {
    const data: ChartData[] = [];
    for (const [id, model] of this.fragmentGroup.groups) {
      let walls = await this.getPropertiesOfSpecificType(
        WEBIFC.IFCWALL,
        "IfcWall",
        "rgba(255, 0, 0, 0.5)",
      );
      if (walls.expressIds.length === 0)
        walls = await this.getPropertiesOfSpecificType(
          WEBIFC.IFCWALLSTANDARDCASE,
          "IfcWallStandardCase",
          "rgba(255, 0, 0, 0.5)",
        );

      const slabs = await this.getPropertiesOfSpecificType(
        WEBIFC.IFCSLAB,
        "IfcSlab",
        "rgba(0, 150, 255, 0.5)",
      );
      const beams = await this.getPropertiesOfSpecificType(
        WEBIFC.IFCBEAM,
        "IfcBeam",
        "rgba(0, 255, 0, 0.5)",
      );
      const earthWorks = await this.getPropertiesOfSpecificType(
        WEBIFC.IFCEARTHWORKSFILL,
        "ifcEarthWorksfill",
        "rgba(255, 0, 128, 0.5)",
      );

      const course = await this.getPropertiesOfSpecificType(
        WEBIFC.IFCCOURSE,
        "ifcCourse",
        "rgba(195, 255, 0, 0.5)",
      );
      data.push(walls);
      data.push(slabs);
      data.push(beams);
      data.push(earthWorks);
      data.push(course);
    }
    return data;
  };

  chartData = (data: ChartData[], chartType: string) => {
    const singleDataset: BarDataset = {
      type: chartType as ChartType,
      data: {
        labels: data.map((item) => {
          return item.elementType;
        }),
        datasets: [
          {
            label: "Quantity",
            data: data.map((item) => {
              return item.expressIds.length;
            }),
            backgroundColor: data.map((item) => {
              return item.color;
            }),
            borderWidth: [2, 2, 2],
            borderRadius: [8, 8, 8],
            borderColor: ["darkred", "darkblue", "darkgreen"],
          },
        ],
      },
    };
    return singleDataset;
  };
}
