const fetch = require("node-fetch");
const moment=require("moment");
const domain="enter.jiradomain.org"

const getData=async (url,authKey) => {  
    var opt={
      // These properties are part of the Fetch Standard
        method: 'GET',
        headers: {'Authorization':`Basic ${authKey}`},        // request headers. format is the identical to that accepted by the Headers constructor (see below)
    }
    var body=await fetch(url,opt);
    const json = await body.json();
    return json;
  }

const getAllSprintsForBoard = async (url,authKey)=> {
    //Get all sprint data
    let startAt=0;
    let maxResults=50;
    let isLast=false;
    let name=[];
    while (!isLast){
      var searchUrl=`${url}?startAt=${startAt}&maxResults=${maxResults}`;
      var body=await getData(searchUrl,authKey);
      var sprintData=body.values.map( v=>{
        return {
          Name:v.name,
          Id:v.id
        }
      } );

      Array.prototype.push.apply(name,sprintData);
      isLast=body.isLast;
      startAt=startAt+maxResults+1;
    }
    return name;
}

const getCurrentSprint = async (url,authKey)=> {
    //Get current sprint
    return await getData(url,authKey);    
}

const getLastNSprints = async (allSprints,currentSprint,numOfSprints)=> {
    var currentSprintIdx=allSprints.findIndex(n=>{
        return n.Id==currentSprint.values[0].id;
    });
    var sprints=[];
    sprints.push(currentSprint.values[0].id)
    for(var i=0;i<numOfSprints;i++){
        var prev=allSprints[currentSprintIdx-(i+1)];
        sprints.push(prev.Id);
    } 
    return sprints;
}

const getSprintIssues= async (url,authKey)=>{
    //Get all issues from these sprints
    var sprintIssuesData=await getData(url,authKey);
    var sprintIssues=sprintIssuesData.issues.map(i=>{
      return {
        Id:i.id,
        Key:i.key
      };
    });
    return sprintIssues;
}

const getIssueWorklogs=async (url,authKey,boardId,issueKey)=>{
    var getIssueData=await getData(url,authKey);
    var issueWorklogs=getIssueData.fields.worklog.worklogs.map(w=>{
        return {
          BoardId:boardId,
          Key:issueKey,
          AuthorName:w.author.name,
          Time:`${(w.timeSpentSeconds/3600)}h`,
          Started:moment(w.started)._d
        }
    });
    return issueWorklogs;
}

const getWorklogsForAllSprintIssues=async (userName,authKey,boardId)=>{
    //Get all sprint data
    let url=`https://${domain}/jira/rest/agile/1.0/board/${boardId}/sprint`;
    let name=await getAllSprintsForBoard(url,authKey);

    //Get current sprint
    var currentSprintUrl=`https://${domain}/jira/rest/agile/1.0/board/${boardId}/sprint?state=active`;
    var currentSprint=await getCurrentSprint(currentSprintUrl,authKey);
    
    //Get last n sprints
    var sprints=await getLastNSprints(name,currentSprint,3);

    var issues=[];
    for(var i=0;i<sprints.length;i++){
      //Get all issues from these sprints
      var sprintIssueUrl=`https://${domain}/jira/rest/agile/1.0/sprint/${sprints[i]}/issue`;
      var sprintIssues=await getSprintIssues(sprintIssueUrl,authKey);
      Array.prototype.push.apply(issues,sprintIssues);
    }

    //
    var worklogs=[];
    var issueUrl=`https://${domain}/jira/rest/agile/1.0/issue`;
    for (var i=0;i<issues.length;i++){
      var getIssueDetailsUrl=`${issueUrl}/${issues[i].Id}`;
      var issueWorklogs=await getIssueWorklogs(getIssueDetailsUrl,authKey,boardId,issues[i].Key);
      Array.prototype.push.apply(worklogs,issueWorklogs);
    };

    var data={
      values:worklogs.filter(f=>f.AuthorName.toLowerCase()===userName.toLowerCase())
    };

    return data;
}

const getWorklogsForAllBoards=async (userName,authKey)=>{
    var boardIds=[17];
    var allWorklogData=[]; 
    for(var i=0;i<boardIds.length;i++){
        var data=await getWorklogsForAllSprintIssues(userName,authKey,boardIds[i]);
        var info={
            BoardId:boardIds[i],
            Values:data.values.sort((a,b)=>{
                return a.Started - b.Started;
            })            
        };
        allWorklogData.push(info)
    }
    return allWorklogData;
}

  exports.getData=getData;
  exports.getAllSprintsForBoard=getAllSprintsForBoard;
  exports.getCurrentSprint=getCurrentSprint;
  exports.getLastNSprints=getLastNSprints;
  exports.getSprintIssues=getSprintIssues;
  exports.getIssueWorklogs=getIssueWorklogs;
  exports.getWorklogsForAllBoards=getWorklogsForAllBoards;