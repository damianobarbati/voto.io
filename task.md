Implement ZAP testing (Zed Attack Proxy) with script-based authentication.  
Add a job to ci.yml named "dast-testing" with `security-events: write`.  
Use a ZAP script that performs the existing SPA JWT flow (jwt based).  
The scan should cover both the web app and the API.  
The scan should be both an active scan and a baseline passive scan.  
The scan should fail for medium and above alerts.  
Reports should be uploaded as one combined SARIF report uploaded as GitHub Code Scanning SARIF, for pull requests, pushes to main and tags.  

ZAP should run as 2 distinct users: 
- lex.luthor@gmail.com: registers, logins and creates the poll
- clark.kent@gmail.com: registers, logins and votes the poll created by lex
For every test user:
- password is `Password123!`
- use faker-js random data
- make sure clark user matches the demographic of lex's poll

About the ZAP authentication: run Lex’s process after bootstrap creates Lex, Clark, and the poll. Run Clark’s process after Clark has voted.   
This gives each scan a clean and stable authenticated identity.  

ZAP should scan all API documentation-discovered endpoints and SSE routes exposed in /packages/api/src/routes.ts