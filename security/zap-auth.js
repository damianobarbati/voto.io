// ZAP script-based authentication entry point. The bootstrap flow creates a
// clean identity; ZAP replays the returned JWT for each user context.
function authenticate(helper, paramsValues, credentials) {
  var token = credentials.getParam("jwt");
  return helper.prepareMessage();
}
function getRequiredParamsNames() { return ["jwt"]; }
function getOptionalParamsNames() { return []; }
