import './lib';

const {
    APP_PORT,    
    TEMP_PATH,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB
} = process.env;

export default {
    APP_PORT: APP_PORT || 8080,    
    TEMP_PATH,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB
};