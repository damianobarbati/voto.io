var HttpHeader = Java.type("org.parosproxy.paros.network.HttpHeader");
var HttpRequestHeader = Java.type("org.parosproxy.paros.network.HttpRequestHeader");
var ScriptVars = Java.type("org.zaproxy.zap.extension.script.ScriptVars");
var URI = Java.type("org.apache.commons.httpclient.URI");

function authenticate(helper, paramsValues, credentials) {
  var message = helper.prepareMessage();
  var requestBody = JSON.stringify({ email: credentials.getParam("email"), password: credentials.getParam("password") });
  var requestUri = new URI(paramsValues.get("loginUrl"), false);
  message.setRequestHeader(new HttpRequestHeader(HttpRequestHeader.POST, requestUri, HttpHeader.HTTP11));
  message.getRequestHeader().setHeader("Content-Type", "application/json");
  message.setRequestBody(requestBody);
  message.getRequestHeader().setContentLength(message.getRequestBody().length());
  helper.sendAndReceive(message);
  if (message.getResponseHeader().getStatusCode() !== 200) throw new Error("ZAP login failed");
  ScriptVars.setGlobalVar("votoJwt", JSON.parse(message.getResponseBody().toString()));
  return message;
}
function getRequiredParamsNames() { return ["loginUrl"]; }
function getOptionalParamsNames() { return []; }
function getCredentialsParamsNames() { return ["email", "password"]; }
