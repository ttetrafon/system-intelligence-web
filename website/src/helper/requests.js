export const htmlMethods = Object.freeze({
  DELETE: Symbol('DELETE'),
  GET: Symbol('GET'),
  POST: Symbol('POST'),
  PUT: Symbol('PUT')
});

/**
 *
 * @param {String} url
 * @param {Symbol} method
 * @param {Object} body
 * @returns {JSON} response json
 */
export async function jsonRequest(url, method, body) {
  // console.log(`---> request(${url}, ${JSON.stringify(body)})`);
  let headers = {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Content-Type": "application/json"
  };
  let requestData = {
    method: method.description,
    headers: headers,
    mode: "cors",
    cache: "no-cache"
  };
  if (body) {
    requestData.body = JSON.stringify(body);
  }
  // console.log("requestData", requestData);
  let request = new Request(url, requestData);
  let response = await fetch(request);
  let status = response.status;
  if (status != 200) return null;

  let res = await response.json();
  // console.log("requestResponse", res);
  return res;
}
/**
 *
 * @param {*} url
 * @param {*} formData
 * @returns
 */
export async function formDataRequest(url, formData) {
  let request = new Request(url, {
    method: 'POST',
    headers: {
      "Accept": "*/*",
      "Connection": "keep-alive"
    },
    body: formData,
    mode: "cors",
    cache: "no-cache"
  });

  let response = await fetch(request);
  return await response.json();
}
/**
 *
 * @param {*} url
 * @returns
 */
export async function fetchJsonData(url) {
  let res = await fetch(url);
  console.log(res);
  if (!(res.ok && res.status == 200)) return null;
  let jsonData = await res.json();
  console.log(jsonData);
  return jsonData;
}

export async function svgRequest(url) {
  let response = await fetch(url);
  let data = await response.text();
  return data;
}
