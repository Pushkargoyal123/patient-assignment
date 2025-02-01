
exports.handler = async(event: any) => {
    try {
        console.log('hello', event);
        console.log('Hello from patient lambda');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Hello from patient lambda' })
        }
    }
    catch (err) {
        console.log('error message', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err })
        }
    }
}