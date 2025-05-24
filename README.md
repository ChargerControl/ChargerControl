# ChargerControl

## Project Abstract
- Our product focus ones on providing a solution for electric vehicle (EV) owners to manage their charging needs more effectively. The ChargerControl app allows users to monitor and control their EV charging process, ensuring that they can charge their vehicles at the most convenient times and rates. The app also provides real-time data on charging status, energy consumption, and cost savings, making it an essential tool for EV owners looking to optimize their charging experience.


## Project Team
| NMec   | Name            | Email                    | Roles            | GitHub       |
|--------|------------------|-------------------------|------------------|--------------|
| 113962 | André Alves     | aaalves@ua.pt            | DevOps Master    | [GitHub](https://github.com/Xxerd) |
| 113372 | Bruno Tavares   | brunotavaresmeixedo@ua.pt| QA Engineer      | [GitHub](https://github.com/brunotavaresz) |
| 113763 | Francisco Pinto | francisco.g.pinto@ua.pt  | Team Leader      | [GitHub](https://github.com/MinolePato) |
| 112714 | Diogo Costa     | dmcosta03@ua.pt          | Product Owner    | [GitHub](https://github.com/costinha03) |

## Project Bookmarks
- [Project Board](https://21tqs2425.atlassian.net/jira/software/projects/SCRUM/boards/1)

## SonarQube run


 ```bash 
mvn clean verify sonar:sonar \
  -Dsonar.projectKey=ChargeControl \
  -Dsonar.projectName='ChargeControl' \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_ea1bbf0b75f7d7de981c00e656fbfa6f911e3975
 ``` 

http://localhost:9000/tutorials?id=ChargerControl&selectedTutorial=local

ou dando commit para a main (ter ngrok a rodar)