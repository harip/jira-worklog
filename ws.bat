nssm remove 'jiraintegration'
nssm install jiraintegration "C:\Program Files\nodejs\node.exe"
nssm set jiraintegration AppDirectory "C:\Projects\GitForks\jiraintegration\server"
nssm set jiraintegration AppParameters "index.js additional_parameters"
nssm set jiraintegration AppStdout "C:\Projects\GitForks\jiraintegration\log\out.log"
nssm set jiraintegration AppStderr "C:\Projects\GitForks\jiraintegration\stdout\out.log"
nssm set jiraintegration AppEnvironmentExtra "PORT=3000"
nssm start jiraintegration