# Twitter Automation Scanner

The application is an automation prepared for Master thesis research and experimenting purposes. The goal of such an automation is to speed up the process of verifying whether the investigated Twitter account can be treated as a potential fake. The scanning process checks the following list of resources:

* Checks the email address - as Twitter does not share the full email address we are not able to get it in a legal way. However it provides a few letters and the length of the email address that is a hint in the investigation. Note that Twitter is not willing to share the email address, there's a chance that the script won't work, e.g. some additional step will be required. Fetching email address bases on a reset password process. Sometimes this process requires passing some additional data that the script is not able to have - phone number or... email that is supposed to be fetched. 
* Verifies whether a profile picture from scanned profile is fake e.g. is generated via [this person does not exist](https://thispersondoesnotexist.com/).
* Basic info about scanned profile:
  * Full name
  * Age and creation date
  * Description
  * Followers and following count
  * Tweets and listed count
* Posts frequency statistics:
  * Average number of posts in a single day - only active days
  * Average number of posts in a single day - including inactive days
  * Last activity date
  * A total number of inactive days
  * Max number of posts in a single day
  * Number of posts probably created via planner - if a post is created via planner then the number of seconds and milliseconds in the timestamp equals 0.
* Used emojis report.

## Application flow diagram

```mermaid
flowchart RL
    A(Actor) -- passes account ID ----> B[Application]
    B -- returns report --> A
    subgraph Application
        C[Profile Picture Scanner] <---> B
        E[Posts Frequency Scanner] <---> B
        F[User Details Scanner] <---> B
        G[Emoji Scanner] <---> B
        K[Daily Frequency Posts Scanner]  <---> B
        L[Mentions Scanner]  <---> B
        D[Email Address Scanner] <---> B
        N[Known Profiles Scanner] <---> B
        O[NASK profiles list] <---> N
        P[Mutual Connections Scanner] <---> B
        M[MongoDB] <---> B
        H[V7 Labs] <---> C
        I["Headless Chrome Browser (Puppeteer)"] <---> D
        J[Twitter REST API] <---> C
        J <---> E
        J <---> F
        J <---> G
        J <---> K
        J <---> L
        J <---> P
    end
```

## Sequence diagram

```mermaid
sequenceDiagram
    actor User as Actor
    participant Application
    participant ScanController
    User->>Application: Passes Id
    Application->>ScanController: Runs
    loop Scanners
        ScanController->>ScanController: Runs all scanners
    end
    ScanController-->>Application: Returns scan results
    Application-->>User: Returns report
```

## Development

To run the automation locally here's the recommended list of software:
* [pnpm - 6.32.9](https://pnpm.io/)
* [Node.js - 16.14.2](https://nodejs.org/en/)

To start the application run the following commands in the root of this repository:
1. `pnpm install ./`
2. `pnpm run start`
3. Open browser and visit `http://localhost:3000/`.

## Jupyter Notebook launch

1. Ensure you have `python3` installed - `python3 --version` and `pip` `python3 -m ensurepip`.
2. Install JupyterLab - `pip3 install jupyterlab`.
3. Install Jupyter Notebook - `pip3 install notebook`.
4. Run notebook - `python3 -m notebook`.
