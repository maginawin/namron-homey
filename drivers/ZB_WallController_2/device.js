'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

module.exports = class ZB_WallController_2 extends ZigBeeDevice {
	onMeshInit() {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		this.log(this.getStore());

		// supported scenes and their reported attribute numbers (all based on reported data)
		this.buttonMap = {
			0: {
				button: 'Group1',
			}
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
2019-09-08 21:06:43 [log] [ManagerDrivers] [ZB_WallController_2] [0] ZigBeeDevice has been inited
2019-09-08 21:06:43 [log] [ManagerDrivers] [ZB_WallController_2] [0] ------------------------------------------
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] Node: fd21de3e-fcec-4026-95a1-7b30b547096a
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] - Battery: true
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] - Endpoints: 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] -- Clusters:
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- zapp
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genBasic
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 9 : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 10 : 00
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 11 : NULL
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 30721 : 3
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 30722 : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 30723 : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 30724 : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 65533 : 1
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genBasic
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- zclVersion : 2
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- appVersion : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- stackVersion : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- hwVersion : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- manufacturerName : Sunricher
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- modelId : ZGRC-KEY-007
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- dateCode : NULL
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- powerSource : 3
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- appProfileVersion : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- swBuildId : 2.2.3_r11
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genPowerCfg
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 65533 : 1
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genPowerCfg
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryVoltage : 30
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryPercentageRemaining : 99
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batterySize : 255
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryQuantity : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryVoltMinThres : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryVoltThres1 : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryVoltThres2 : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryVoltThres3 : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- batteryAlarmState : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genIdentify
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 65533 : 1
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genIdentify
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- identifyTime : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genGroups
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genGroups
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genOnOff
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genOnOff
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genLevelCtrl
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genLevelCtrl
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- genOta
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : genOta
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- haDiagnostic
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 65533 : 1
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : haDiagnostic
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- numberOfResets : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- lastMessageLqi : 254
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- lastMessageRssi : -64
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] --- lightLink
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- 65533 : 1
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- cid : lightLink
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ---- sid : attrs
2019-09-08 21:06:44 [log] [ManagerDrivers] [ZB_WallController_2] [0] ------------------------------------------

*/
