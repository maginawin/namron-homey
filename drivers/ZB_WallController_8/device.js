'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

module.exports = class ZB_WallController_8 extends ZigBeeDevice {
	onMeshInit() {

		// enable debugging
		// this.enableDebug();

		// print the node's info to the console
		// this.printNode();

		this.log(this.getStore());

		// supported scenes and their reported attribute numbers (all based on reported data)
		this.buttonMap = {
			0: {
				button: 'Group1',
			},
			1: {
				button: 'Group2',
			},
			2: {
				button: 'Group3',
			},
			3: {
				button: 'Group4',
			},
		};

		this.sceneMap = {
			on: {
				scene: 'Switched ON',
			},
			off: {
				scene: 'Switched OFF',
			},
			moveWithOnOff_move_up: {
				scene: 'Dimming UP',
			},
			moveWithOnOff_move_down: {
				scene: 'Dimming DOWN',
			},
			stopWithOnOff: {
				scene: 'Dimming STOP',
			},
		};

		// Register measure_battery capability
		this.registerCapability('measure_battery', 'genPowerCfg');

		this.registerAttrReportListener('genPowerCfg', 'batteryPercentageRemaining', 10, 60, 1, this.onPowerCfgBatteryPercentageRemainingReport.bind(this), 0)
			.then(() => {
				this.log('registered attr report listener');
			})
			.catch(err => {
				this.error('failed to register attr report listener', err);
			}
		);

		let clustersArray = ['genOnOff', 'genLevelCtrl'];
		this.log(clustersArray, Object.keys(clustersArray));

		Object.keys(this.node.endpoints).forEach(endpointsID => {
			this.log('- Endpoints:', endpointsID);

			Object.keys(clustersArray).forEach(clusterID => {
				this.log('-- Clusters:', clustersArray[clusterID]);
				if (typeof this.node.endpoints[endpointsID].clusters[clustersArray[clusterID]] !== 'undefined') {
					if (this.getStoreValue(`${endpointsID}_${clustersArray[clusterID]}_bind`) !== true) {
						this.log('binding:', this.node.endpoints[endpointsID].clusters[clustersArray[clusterID]]);
						this.node.endpoints[endpointsID].clusters[clustersArray[clusterID]].bind()
						.then(result => {
							this.setStoreValue(`${endpointsID}_${clustersArray[clusterID]}_bind`, true);
							this.log(`Registered ${clustersArray[clusterID]} cluster on endpoint ${endpointsID}`, result);
						})
						.catch(err => {
							if (err) this.log(`Something went wrong while binding the ${clustersArray[clusterID]} cluster on endpoint ${endpointsID}`, err);
						});
					}
				}
			});
		});

		this.node.on('command', (command) => {
			let remoteValue = {};
			if (command.attr === 'moveWithOnOff') {
				remoteValue = {
					button: this.buttonMap[command.endpoint].button,
					scene: this.sceneMap[`${command.attr}_move_${command.value.movemode === 1 ? 'up' : 'down'}`].scene,
				};
			} else {
				remoteValue = {
					button: this.buttonMap[command.endpoint].button,
					scene: this.sceneMap[`${command.attr}`].scene,
				};
			}
			this.log('Triggering sequence: remoteValue', remoteValue);

			// Trigger the trigger card with 2 autocomplete options
			Homey.app.triggerWallController_scene.trigger(this, null, remoteValue);
			// Trigger the trigger card with tokens
			Homey.app.triggerWallController_button.trigger(this, remoteValue, null);
		});

	}

	onSceneAutocomplete(query, args, callback) {
		let resultArray = [];
		for (let sceneID in this.sceneMap) {
			resultArray.push({
				id: this.sceneMap[sceneID].scene,
				name: Homey.__(this.sceneMap[sceneID].scene),
			});
		}
		// filter for query
		resultArray = resultArray.filter(result => {
			return result.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
		});
		this.log(resultArray);
		return Promise.resolve(resultArray);
	}

	onButtonAutocomplete(query, args, callback) {
		let resultArray = [];
		for (let sceneID in this.buttonMap) {
			resultArray.push({
				id: this.buttonMap[sceneID].button,
				name: Homey.__(this.buttonMap[sceneID].button),
			});
		}

		// filter for query
		resultArray = resultArray.filter(result => {
			return result.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
		});
		this.log(resultArray);
		return Promise.resolve(resultArray);
	}

	onPowerCfgBatteryPercentageRemainingReport(value) {
		this.log('onPowerCfgBatteryPercentageRemainingReport', value);
		if (this.hasCapability('alarm_battery')) this.setCapabilityValue('alarm_battery', value < 10);
		this.setCapabilityValue('measure_battery', value);
	}

}

/*
2019-04-18 21:16:32 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ZigBeeDevice has been inited
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ZigBeeDevice has been inited
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ------------------------------------------
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] Node: 09ef33b5-aa79-4f1e-9c7d-f74fb8f91567
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] - Battery: true
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] - Endpoints: 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] -- Clusters:
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- zapp
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 9 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 10 : 00
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 11 : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30721 : 5
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30722 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30723 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30724 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- zclVersion : 2
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- stackVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- hwVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- manufacturerName : Sunricher
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- modelId : ZG2833K8_EU05
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- dateCode : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- powerSource : 3
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appProfileVersion : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- swBuildId : 2.2.3_r11
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltage : 30
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryPercentageRemaining : 96
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batterySize : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryQuantity : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltMinThres : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres1 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres2 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres3 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryAlarmState : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- identifyTime : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- numberOfResets : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageLqi : 254
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageRssi : -53
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] - Endpoints: 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] -- Clusters:
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- zapp
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 9 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 10 : 00
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 11 : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30721 : 5
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30722 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30723 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30724 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- zclVersion : 2
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- stackVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- hwVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- manufacturerName : Sunricher
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- modelId : ZG2833K8_EU05
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- dateCode : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- powerSource : 3
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appProfileVersion : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- swBuildId : 2.2.3_r11
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltage : 30
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryPercentageRemaining : 96
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batterySize : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryQuantity : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltMinThres : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres1 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres2 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres3 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryAlarmState : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- identifyTime : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- numberOfResets : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageLqi : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageRssi : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] - Endpoints: 2
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] -- Clusters:
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- zapp
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 9 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 10 : 00
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 11 : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30721 : 5
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30722 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30723 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30724 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- zclVersion : 2
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- stackVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- hwVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- manufacturerName : Sunricher
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- modelId : ZG2833K8_EU05
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- dateCode : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- powerSource : 3
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appProfileVersion : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- swBuildId : 2.2.3_r11
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltage : 30
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryPercentageRemaining : 96
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batterySize : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryQuantity : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltMinThres : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres1 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres2 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres3 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryAlarmState : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genIdentify
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- identifyTime : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genGroups
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genScenes
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOnOff
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genLevelCtrl
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOta
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : haDiagnostic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- numberOfResets : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageLqi : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageRssi : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : lightLink
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] - Endpoints: 3
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] -- Clusters:
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- zapp
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 9 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 10 : 00
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 11 : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30721 : 5
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30722 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30723 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 30724 : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genBasic
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- zclVersion : 2
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- stackVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- hwVersion : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- manufacturerName : Sunricher
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- modelId : ZG2833K8_EU05
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- dateCode : NULL
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- powerSource : 3
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- appProfileVersion : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- swBuildId : 2.2.3_r11
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genPowerCfg
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltage : 30
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryPercentageRemaining : 96
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batterySize : 255
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryQuantity : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltMinThres : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres1 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres2 : 0
2019-04-18 21:16:36 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryVoltThres3 : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- batteryAlarmState : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genIdentify
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genIdentify
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- identifyTime : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genGroups
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genGroups
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genScenes
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genScenes
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOnOff
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOnOff
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genLevelCtrl
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genLevelCtrl
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- genOta
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : genOta
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- haDiagnostic
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : haDiagnostic
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- numberOfResets : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageLqi : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- lastMessageRssi : 0
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] --- lightLink
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- 65533 : 1
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- cid : lightLink
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ---- sid : attrs
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] ------------------------------------------
2019-04-18 21:16:37 [log] [ManagerDrivers] [ZB_WallController_8] [0] GreenPowerProxy endpoint:  0

*/
