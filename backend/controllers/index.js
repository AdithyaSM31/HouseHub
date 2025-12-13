/**
 * Database Controller Router
 * Routes to the correct controller based on database type
 */

const useMongoDB = !!process.env.MONGODB_URI;

// Export the appropriate controllers
module.exports = {
  authController: useMongoDB 
    ? require('./authController') 
    : require('./authController_sqlite'),
  
  propertyController: useMongoDB 
    ? require('./propertyController') 
    : require('./propertyController_sqlite'),
  
  bookmarkController: useMongoDB 
    ? require('./bookmarkController') 
    : require('./bookmarkController_sqlite'),
  
  messageController: useMongoDB 
    ? require('./messageController') 
    : require('./messageController_sqlite')
};
