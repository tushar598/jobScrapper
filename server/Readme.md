## Server Folder Structure

```
server/
├── .env
├── package.json
├── package-lock.json
├── README.md
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controller/
    │   ├── internshipController.js
    │   ├── jobController.js
    │   ├── parserController.js
    │   ├── resumeController.js
    │   └── userController.js
    ├── middlewares/
    │   ├── internship.js
    │   ├── job.js
    │   ├── resume.js
    │   ├── scraplog.js
    │   └── user.js
    ├── models/
    │   ├── internship.js
    │   ├── job.js
    │   ├── resume.js
    │   ├── scraplog.js
    │   └── user.js
    ├── routes/
    │   ├── internshipRoutes.js
    │   ├── jobRoutes.js
    │   ├── parserRoutes.js
    │   ├── resumeRoutes.js
    │   └── userRoutes.js
    ├── scraper/
    │   ├── internshipScraper.js
    │   └── jobScraper.js
    ├── services/
    │   └── parser/
    │       └── resumeParser.js
    └── workers/
        └── cronWorker.js

        ```

##Data Flow Summary (Visual Flow)

        [User - React UI]
                │
                ▼
      Upload Resume (PDF/DOC)
                │
                ▼
      [Backend API - Express/Node]
                │
                ▼
     Resume Parser (Node/Python NLP)
                │
        (Extract Skills + Location)
                ▼
           Store in MongoDB
                │
                ▼
        Trigger Scrape Queue (BullMQ)
                │
                ▼
         [Worker Node Process]
       ├── indeed.adapter
       ├── naukri.adapter
       ├── internshala.adapter
                │
        (Fetch + Normalize Jobs)
                ▼
          Store in MongoDB
                │
                ▼
      Match Resume ↔ Job Skills
                │
                ▼
         Send Sorted Matches
                │
                ▼
      [React Dashboard Display]
