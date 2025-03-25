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
      "IFCPROPERTYSINGLEVALUE",
      "IFCQUANTITYLENGTH",
      "IFCQUANTITYAREA",
      "IFCQUANTITYVOLUME",
      "IFCSLAB",
      "IFCWALL",
      "IFCBEAM",
      "IFCPROPERTYSET",
      "IFCRELDEFINESBYPROPERTIES",
      "IFCMATERIAL"
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
          { role:"system",  content:`Based on the given information You should only create the response based on the information given. Information that is not found on the given data should not be presented on the result` },
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