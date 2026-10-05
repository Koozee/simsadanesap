// Code.gs

function doGet(e) {
  const action = e.parameter.action;
  
  if (!action) {
    return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Parameter action tidak ditemukan'));
  }

  if (action === 'students.list') {
    return withRead(action, function() {
      return getStudentsList();
    });
  }
  
  return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action GET tidak dikenali: ' + action));
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return makeJsonResponse(apiFail('INVALID_INPUT', 'Body bukan JSON valid'));
  }

  const action = body.action;
  const params = body.params || {};

  if (!action) {
    return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action POST tidak ditemukan'));
  }

  return makeJsonResponse(apiFail('UNKNOWN_ACTION', 'Action POST tidak dikenali: ' + action));
}
