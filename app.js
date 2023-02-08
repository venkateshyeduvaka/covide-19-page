const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/states/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      state;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(playersArray);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      state 
    WHERE 
      state_Id = ${stateId};`;
  const player = await database.get(getPlayerQuery);
  response.send(player);
});

app.post("/districts/", async (request, response) => {
  const { disrictName, stateId, cases, cured, active, deaths } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    district (disrict_Name, state_Id, cases, cured, active, deaths)
  VALUES
    ('${disrictName}', ${stateId}, ${cases},${cured},${active}, ${deaths});`;
  const player = await database.run(postPlayerQuery);
  response.send("Player Added to Team");
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    district
  WHERE
    district_Id = ${districtId};`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
select state_id from district
where district_id = ${districtId};
`; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
select state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};
`; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
}); //sending the required response

module.exports = app;
