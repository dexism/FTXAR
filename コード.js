/**
 * FTXAR - Google Apps Script Server Side
 * Version: 2610082335
 * Updated: 2026-10-08T23:35:00
 * 
 * 役割:
 * - Web App エントリポイント (doGet, doPost)
 * - 射撃任務データストア (PropertiesService / CacheService)
 * - サーバー時刻 (NTP同期用 UNIXミリ秒) 提供
 */

const APP_VERSION = '2610082335';

/**
 * Web App 初期アクセスハンドラ
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  template.version = APP_VERSION;
  
  var output = template.evaluate()
    .setTitle('FTXAR - 砲兵弾着観測WebAR')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
  return output;
}

/**
 * 外部HTMLファイル埋め込み用ヘルパー
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * サーバーの現在時刻 (UNIXミリ秒) を取得 (端末のNTP同期用)
 * @return {number}
 */
function getServerTime() {
  return Date.now();
}

/**
 * 射撃任務一覧の取得
 * @return {Array<Object>}
 */
function getFireMissions() {
  try {
    var props = PropertiesService.getScriptProperties();
    var missionsJson = props.getProperty('FTXAR_MISSIONS');
    if (!missionsJson) {
      return [];
    }
    return JSON.parse(missionsJson);
  } catch (err) {
    console.error('getFireMissions error:', err);
    return [];
  }
}

/**
 * 射撃任務の作成または更新
 * @param {Object} mission
 * @return {Object}
 */
function saveFireMission(mission) {
  try {
    var props = PropertiesService.getScriptProperties();
    var missionsJson = props.getProperty('FTXAR_MISSIONS');
    var missions = missionsJson ? JSON.parse(missionsJson) : [];
    
    // 既存ミッションのIDを検索
    var foundIndex = -1;
    for (var i = 0; i < missions.length; i++) {
      if (missions[i].id === mission.id) {
        foundIndex = i;
        break;
      }
    }
    
    if (foundIndex >= 0) {
      missions[foundIndex] = mission;
    } else {
      missions.unshift(mission);
    }
    
    // 最大20件まで保持
    if (missions.length > 20) {
      missions = missions.slice(0, 20);
    }
    
    props.setProperty('FTXAR_MISSIONS', JSON.stringify(missions));
    return { success: true, mission: mission, timestamp: Date.now() };
  } catch (err) {
    console.error('saveFireMission error:', err);
    return { success: false, error: err.toString() };
  }
}

/**
 * 射撃任務ステータスの更新 (例: ACTIVE -> CEASE_FIRE / COMPLETED)
 * @param {string} missionId
 * @param {string} status 'ACTIVE' | 'CEASE_FIRE' | 'COMPLETED'
 * @return {Object}
 */
function updateFireMissionStatus(missionId, status) {
  try {
    var props = PropertiesService.getScriptProperties();
    var missionsJson = props.getProperty('FTXAR_MISSIONS');
    if (!missionsJson) return { success: false, error: 'No missions found' };
    
    var missions = JSON.parse(missionsJson);
    var updated = false;
    for (var i = 0; i < missions.length; i++) {
      if (missions[i].id === missionId) {
        missions[i].status = status;
        missions[i].updatedAt = Date.now();
        updated = true;
        break;
      }
    }
    
    if (updated) {
      props.setProperty('FTXAR_MISSIONS', JSON.stringify(missions));
      return { success: true, missionId: missionId, status: status, timestamp: Date.now() };
    }
    return { success: false, error: 'Mission not found' };
  } catch (err) {
    console.error('updateFireMissionStatus error:', err);
    return { success: false, error: err.toString() };
  }
}

/**
 * 全射撃任務のクリア
 */
function clearAllFireMissions() {
  PropertiesService.getScriptProperties().deleteProperty('FTXAR_MISSIONS');
  return { success: true, timestamp: Date.now() };
}

/**
 * POSTリクエストによるAPI呼び出し
 */
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action;
    var result = null;
    
    if (action === 'getServerTime') {
      result = { serverTime: getServerTime() };
    } else if (action === 'getMissions') {
      result = { missions: getFireMissions(), serverTime: Date.now() };
    } else if (action === 'saveMission') {
      result = saveFireMission(data.mission);
    } else if (action === 'updateStatus') {
      result = updateFireMissionStatus(data.missionId, data.status);
    } else {
      result = { error: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
