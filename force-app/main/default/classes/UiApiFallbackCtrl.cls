public with sharing class UiApiFallbackCtrl {
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getTaskDescribe() {
        try {
            System.debug('GETTING TASK IN getTaskDescribe() ');
            Schema.DescribeSObjectResult d = Task.SObjectType.getDescribe();

            Map<String,Schema.SObjectField> fields = d.fields.getMap();
            List<Map<String,Object>> fieldList = new List<Map<String,Object>>();

            for (Schema.SObjectField f : fields.values()) {
                Schema.DescribeFieldResult fr = f.getDescribe();
                
                fieldList.add(new Map<String,Object>{
                    'apiName' => fr.getName(),
                    'label' => fr.getLabel(),
                    'dataType' => String.valueOf(fr.getType())
                });
            }
            System.debug('HERRE IS THE TASK RESULT');
            System.debug(fieldList);
            return new Map<String,Object>{
                'apiName' => d.getName(),
                'label' => d.getLabel(),
                'fields' => fieldList
            };
         } catch (Exception e) {
            throw new AuraHandledException('Error Task UI data: ' + e.getMessage());
        }
    }
}