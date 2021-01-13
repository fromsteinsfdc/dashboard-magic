@isTest
public class ReportFakerControllerTest {
    @isTest
    public static void doTest() {
        Fake_Report_Data_Object__c newFake = new Fake_Report_Data_Object__c();
        newFake.Group__c = 'testgroup';
        newFake.Label__c = 'Product Family';
        newFake.Secondary_Grouping__c = 'Product Line';
        newFake.Value__c = 50000;
        insert newFake;
        List<Fake_Report_Data_Object__c> existingFakes = ReportFakerController.getExistingGroupMembers('testgroup');
        String jsonFake = JSON.serialize(existingFakes);
        ReportFakerController.saveFakeData(jsonFake);
        ReportFakerController.getBaseReportId();


        
        ReportFakerController.getMetadataColumn('Column Name', false);
        ReportFakerController.getMetadataBucket('MyFieldName', 'Field Label', 0);
        ReportFakerController.getMetadataGrouping('MyGroupingName');
        ReportFakerController.getMetadataFilter('MyFilterString');
        ReportFakerController.getFormulaColumn('FormulaName', 'number');

        // Set mock callout class 
        Test.startTest();
        MetadataService.SaveResult saveRes = new MetadataService.SaveResult();
        saveRes.success = false;
        try {
            ReportFakerController.handleSaveResults(saveRes);
        } catch(Exception e) {}
        ReportFakerController.getExistingFakeData();

        ReportFakerController controller = new ReportFakerController();
        PageReference pageRef = Page.userSessionIdHelper;
        Test.setCurrentPage(pageRef);
        pageRef.getParameters().put('group', 'Test report');
        pageRef.getParameters().put('reportName', 'My Report');
        pageRef.getParameters().put('primaryGrouping', 'Rep Name');
        pageRef.getParameters().put('secondaryGrouping', 'Activity Type');
        pageRef.getParameters().put('metricName', 'My Value');
        pageRef.getParameters().put('metricType', 'number');
        try {
            controller.vfController();
        } catch(Exception e) {}
        try {
            //UserSessionIdHelperController.padMyCodeCoverage();
            //UserSessionIdHelperController.fetchUserSessionId();
        } catch (Exception e){}
        // Call method to test.
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
        //MetadataService.SaveResult res = ReportFakerController.createReport('ReportFakerController', 'Fromstein Test', newFake.Label__c, newFake.Secondary_Grouping__c, 'Value', 'number');        
        Test.stopTest();
    }
}
