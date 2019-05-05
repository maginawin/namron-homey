'use strict';

const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

module.exports = class ZB_Switch extends ZigBeeLightDevice {
	async onMeshInit() {

			// this.setStoreValue('colorTempMin', 153); // 6500K = 153 Mired
			// this.setStoreValue('colorTempMax', 370); // 2700K = 370 Mired

      await super.onMeshInit();
      // enable debugging
      this.enableDebug();

      // print the node's info to the console
      this.printNode();

			this.log('GreenPowerProxy endpoint: ', this.getClusterEndpoint('genGreenPowerProxy'));

      if (this.getClusterEndpoint('genGreenPowerProxy') !== 0) {
        this.registerAttrReportListener('genOnOff', 'onOff', 1, 300, 1, value => {
          this.log('onoff', value);
          this.setCapabilityValue('onoff', value === 1);
        }, 0);

      }

	}

}

/*
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ZigBeeDevice has been inited
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ------------------------------------------
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] Node: 974d5b7c-b793-4db0-b0e0-aecbc93d3009
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] - Battery: false
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] - Endpoints: 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] -- Clusters:
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- zapp
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genBasic
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 9 : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 10 : 00
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 11 : NULL
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 30721 : 260
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 30722 : 269
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 30723 : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 30724 : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 34819 : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 34820 : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 36864 : 2
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genBasic
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- zclVersion : 3
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- appVersion : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- stackVersion : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- hwVersion : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- manufacturerName : Sunricher
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- modelId : ON/OFF
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- dateCode : NULL
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- powerSource : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- appProfileVersion : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- swBuildId : 2.4.1_r32
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genIdentify
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genIdentify
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- identifyTime : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genGroups
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genGroups
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- nameSupport : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genScenes
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genScenes
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- count : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- currentScene : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- currentGroup : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sceneValid : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- nameSupport : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genOnOff
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genOnOff
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- onOff : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- globalSceneCtrl : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- onTime : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- offWaitTime : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genLevelCtrl
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 15 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 16384 : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genLevelCtrl
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- currentLevel : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- remainingTime : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- onOffTransitionTime : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- onLevel : 255
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genOta
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genOta
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- haDiagnostic
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : haDiagnostic
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- numberOfResets : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- lastMessageLqi : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- lastMessageRssi : 0
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- lightLink
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : lightLink
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] - Endpoints: 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] -- Clusters:
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- zapp
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] --- genGreenPowerProxy
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 0 : 20
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 1 :
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 2 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 3 : 3
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 4 : 180
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 5 : 1
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 6 : 1027631
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 7 : 16777215
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 32 : 3
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 33 : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 34 : [ 90, 105, 103, 66, 101, 101, 65, 108, 108, 105, 97, 110, 99, 101, 48, 57 ]
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- 65533 : 2
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- cid : genGreenPowerProxy
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ---- sid : attrs
2019-05-05 09:45:11 [log] [ManagerDrivers] [ZB_Switch] [0] ------------------------------------------

*/
