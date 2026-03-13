import type { DataLinks, GameSystemData } from "@app-types/game";

export async function buildDataLinks(gameData: GameSystemData): Promise<DataLinks> {
  console.log("---> buildDataLinks()");
  console.log(gameData);
  let dataLinks: DataLinks = {
    gameSystem: []
  }



  return dataLinks;
}
