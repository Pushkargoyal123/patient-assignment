exports.handler = (event: any) => {
    console.log('hello', event);
    console.log('Hello from patient lambda');
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from patient lambda')
    };
}