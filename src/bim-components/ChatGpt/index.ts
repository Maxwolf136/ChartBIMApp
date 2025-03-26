import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import OpenAI from "openai";

type QuerryData = {
  message:string
}

type GptData = {
  message:string,
  fileData: string,
}

export class ChatGpt extends OBC.Component{
  enabled: boolean = true;
  static uuid = OBC.UUID.create();
  fileData : string | null = null; 

  constructor(components:OBC.Components){
    super(components);
    components.add(ChatGpt.uuid, this);

  }

  getModelData = ()=>{
    const fragmentManager = this.components.get(OBC.FragmentsManager);
    console.log("fragmdntManager: ", fragmentManager);
  }

  getQuerry = async (data:GptData)=>{
    const {message, fileData} = data;
    console.log("Message: ",message);
    console.log("fileData: ", this.fileData);
    return await this.sendQuerryToGPT(data);
  }

  modifyDataDile = ()=>{
    if(! this.fileData) return;
    const validENtities = new Set([
      "IFCBEAM",
      "IFCPROPERTYSET",
      "IFCWALL"
    ]);

    var result = this.fileData.split("\n").filter(line=>{
      const pattern = new RegExp("^#\\d+=(\\w+)");
      const match = line.match(/^#\d+\s*=\s*(\w+)/);
      if(!match) return false;
      const entityName = match[1].trim();
      return validENtities.has(entityName);
    }).join("\n");
    console.log("regexResult: ", result);
    return result;
  }

  sendQuerryToGPT =async (data:GptData)=>{
    const {message, fileData} = data;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log("apiKey: ", import.meta.env.VITE_OPENAI_API_KEY);
    //const client = new OpenAI();

    const response = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model:"gpt-3.5-turbo",
        messages:[
          { 
            role:"system",  
            content:`Based on the given information, you should generate responses strictly from the provided data. Any information not present in the given data should not be included in the response.
              Your response must be returned as a single JSON object containing two formats::
              1. Format for Chart.js (Detailed Format)
              This format is used to generate the chart and should be structured as follows
              [
                {
                  "expressIds": number[],
                  "elementType": string,
                  "color": string
                }
              ]
              expressIds: An array of express IDs for elements that meet the specified conditions.
              elementType: The name of the IFC element.
              color: A randomly chosen RGB color for the chart, ensuring that colors are not repeated.
              For example, if I ask how many elements exist per level in the model, the response should be:

              [
                {
                  "expressIds": [123, 456, 789],
                  "elementType": "Level 3",
                  "color": "rgb(123,45,56)"
                },
                {
                  "expressIds": [987, 654, 321],
                  "elementType": "Level 2",
                  "color": "rgb(200,100,50)"
                }
              ]
              2. Format for HTML Tag (Simplified Format)
              This is a string containing a short, formatted summary of the data, where each line follows the pattern:
              "<elementType>: <count> elements"

              Each line should contain the elementType followed by the count of elements in that category.
              Express IDs and colors are not included in this format.
              The structure should be simple and easy to read.

              Example Request & Response
              If I ask:
              "How many elements per level do I have in the model?"
              Your response should be:

              {
              "chartData": [
                {
                  "expressIds": [123, 456, 789],
                  "elementType": "Level 3",
                  "color": "rgb(123,45,56)"
                },
                {
                  "expressIds": [987, 654, 321],
                  "elementType": "Level 2",
                  "color": "rgb(200,100,50)"
                }
              ],
              "htmlSummary": "Level 3: 3 elements\nLevel 2: 3 elements"
            }


              ` 
          },
          { role: "user", content: `Here is the file content:\n${this.modifyDataDile()}\n\nNow answer this question: ${message}` }
        ]
      })
    });
    console.log("number of words: ", this.fileData?.length);
    console.log("number of words after short: ", this.modifyDataDile()?.length);
    const responseData = await response.json();
    console.log("gpt response: ", responseData);
    return responseData;
  }


}