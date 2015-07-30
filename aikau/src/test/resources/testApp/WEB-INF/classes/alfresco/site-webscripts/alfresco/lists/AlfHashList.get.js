model.jsonModel = {
   services: [
      {
         name: "alfresco/services/LoggingService",
         config: {
            loggingPreferences: {
               enabled: true,
               all: true
            }
         }
      },
      "alfresco/services/NavigationService"
   ],
   widgets: [
      {
         id: "SET_HASH1",
         name: "alfresco/buttons/AlfButton",
         config: {
            label: "Set hash (shouldn't trigger load - no update vars)",
            publishTopic: "ALF_NAVIGATE_TO_PAGE",
            publishPayload: {
               url: "var3=test3",
               type: "HASH"
            }
         }
      },
      {
         id: "SET_HASH2",
         name: "alfresco/buttons/AlfButton",
         config: {
            label: "Set hash (shouldn't trigger load - missing required var)",
            publishTopic: "ALF_NAVIGATE_TO_PAGE",
            publishPayload: {
               url: "var1=test1&var3=test3",
               type: "HASH"
            }
         }
      },
      {
         id: "SET_HASH3",
         name: "alfresco/buttons/AlfButton",
         config: {
            label: "Set hash (shouldn't trigger load - var3 not equal to required value)",
            publishTopic: "ALF_NAVIGATE_TO_PAGE",
            publishPayload: {
               url: "var1=test1&var2=test2&var3=pickle",
               type: "HASH"
            }
         }
      },
      {
         id: "SET_HASH4",
         name: "alfresco/buttons/AlfButton",
         config: {
            label: "Set hash (should trigger load)",
            publishTopic: "ALF_NAVIGATE_TO_PAGE",
            publishPayload: {
               url: "var1=test1&var2=test2&var3=test3",
               type: "HASH"
            }
         }
      },
      {
          id: "SET_FILTER1",
          name: "alfresco/buttons/AlfButton",
          config: {
             label: "Register simple filter (should trigger load)",
             publishTopic: "SIMPLE_FILTER",
             publishPayload: {
                name: "simple",
                value: "simpleFilterValue"
             }
          }
      },
      {
          id: "SET_FILTER2",
          name: "alfresco/buttons/AlfButton",
          config: {
             label: "Register complex filter (should trigger load)",
             publishTopic: "COMPLEX_FILTER",
             publishPayload: {
                name: "complex",
                value: {
                    type : "complexFilterType",
                    param : "complexFilterParamValue",
                    dummy : null
                }
             }
          }
      },
      {
         id: "HASHLIST1",
         name: "alfresco/lists/AlfHashList",
         config: {
            useHash: true,
            hashVarsForUpdate: [
               "var1",
               "var2"
            ],
            hashVarsForUpdateRequired: [
               "var1",
               "var2"
            ],
            hashVarsForUpdateMustEqual: [
               {
                  name: "var3",
                  value: "test3"
               }
            ],
            mapHashVarsToPayload: true,
            filteringTopics : [ "SIMPLE_FILTER", "COMPLEX_FILTER" ],
            widgets: [
               {
                  name: "alfresco/lists/views/AlfListView",
                  config: {
                     additionalCssClasses: "bordered",
                     noItemsMessage: "No results",
                     widgets: [
                        {
                           name: "alfresco/lists/views/layouts/Row",
                           config: {
                              widgets: [
                                 {
                                    name: "alfresco/lists/views/layouts/Cell",
                                    config: {
                                       additionalCssClasses: "mediumpad",
                                       widgets: [
                                          {
                                             name: "alfresco/renderers/Property",
                                             config: {
                                                propertyToRender: "name"
                                             }
                                          }
                                       ]
                                    }
                                 }
                              ]
                           }
                        }
                     ]
                  }
               }
            ]
         }
      },
      {
         name: "alfresco/logging/SubscriptionLog"
      }
   ]
};