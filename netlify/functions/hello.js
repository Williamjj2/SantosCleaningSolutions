exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Netlify Functions working!",
            path: event.path,
            method: event.httpMethod
        })
    };
};
