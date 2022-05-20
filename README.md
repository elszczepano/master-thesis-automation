# Twitter Automation Scanner

The application is an automation prepared for Master thesis research and experimenting purposes. The goal of such an automation is to speed up the process of verifying whether the investigated Twitter account can be treated as a potential fake. The scanning process checks the following list of resources:

* Checks the email address - as Twitter does not share the full email address we are not able to get it in a legal way. However it provides a few letters and the length of the email address that is a hint in the investigation. Note that Twitter is not willing to share the email address, there's a chance that the script won't work, e.g. some additional step will be required. Fetching email address bases on a reset password process. Sometimes this process requires passing some additional data that the script is not able to have - phone number or... email that is supposed to be fetched. 
* Verifies whether a profile picture from scanned profile is fake e.g. is generated via [this person does not exist](https://thispersondoesnotexist.com/).

## Development

To run the automation locally here's the recommended list of software:
* [pnpm - 6.32.9](https://pnpm.io/)
* [Node.js - 16.14.2](https://nodejs.org/en/)

To start the application run the following commands in the root of this repository:
1. `pnpm install ./`
2. `pnpm run start`
3. Open browser and visit `http://localhost:3000/`.