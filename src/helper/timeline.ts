/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

declare const window, __VRT_PLAYBACK_SPEED__, __VRT_LOG_ERRORS__;

let mockedRaf = null;
let mockedTimeout = null;
let mockedTimeoutClear = null;
let mockedInterval = null;
let mockedIntervalClear = null;

if (typeof __VRT_PLAYBACK_SPEED__ === 'undefined') {
    window.__VRT_PLAYBACK_SPEED__ = 1;
}

let isMocking = false;
const nativeRaf = window.requestAnimationFrame;
const nativeSetTimeout = window.setTimeout;
const nativeSetInterval = window.setInterval;
const nativeClearTimeout = window.clearTimeout;
const nativeClearInterval = window.clearInterval;
const nativeDate = window.Date;

let fixedFrameTime = 16;
const MAX_FRAME_TIME = 80;
const TIMELINE_START = 1566458693300;

let realFrameStartTime = 0;

/** Control timeline loop */
let rafCbs = [];
let frameIdx = 0;
let timelineTime = 0;

function runFrame() {
    realFrameStartTime = NativeDate.now();
    frameIdx++;
    timelineTime += fixedFrameTime;
    const currentRafCbs = rafCbs;
    // Clear before calling the callbacks. raf may be registered in the callback
    rafCbs = [];
    currentRafCbs.forEach((cb) => {
        try {
            cb();
        }
        catch (e) {
            // Catch error to avoid following tasks.
            __VRT_LOG_ERRORS__(e.toString());
        }
    });
    flushTimeoutHandlers();
    flushIntervalHandlers();
}
function timelineLoop() {
    if (!isMocking) {
        return;
    }
    runFrame();
    nativeRaf(timelineLoop);
}

mockedRaf = function (cb) {
    rafCbs.push(cb);
};

/** Mock setTimeout, setInterval */
let timeoutHandlers = [];
let intervalHandlers = [];

let timeoutId = 1;
let intervalId = 1;

mockedTimeout = function (cb, timeout) {
    const elapsedFrame = Math.ceil(Math.max(timeout || 0, 1) / fixedFrameTime);
    timeoutHandlers.push({
        callback: cb,
        id: timeoutId,
        frame: frameIdx + elapsedFrame
    });

    return timeoutId++;
}

mockedTimeoutClear = function (id) {
    const idx = timeoutHandlers.findIndex(handler => {
        return handler.id === id
    });
    if (idx >= 0) {
        timeoutHandlers.splice(idx, 1);
    }
}

function flushTimeoutHandlers() {
    // Copy the array. In case setTimeout/clearTimeout is invoked in the callback.
    const savedTimeoutHandlers = timeoutHandlers.slice();
    for (let i = 0; i < savedTimeoutHandlers.length; i++) {
        const handler = savedTimeoutHandlers[i];
        if (handler.frame === frameIdx) {
            // Need find index again. In case setTimeout/clearTimeout is invoked in the callback.
            const idx = timeoutHandlers.indexOf(handler);
            timeoutHandlers.splice(idx, 1);
            try {
                handler.callback();
            }
            catch (e) {
                // Catch error to avoid following tasks.
                // __VRT_LOG_ERRORS__(e.toString());
            }
        }
    }
}

mockedInterval = function (cb, interval) {
    const intervalFrame = Math.ceil(Math.max(interval || 0, 1) / fixedFrameTime);
    intervalHandlers.push({
        callback: cb,
        id: intervalId,
        intervalFrame,
        frame: frameIdx + intervalFrame
    });

    return intervalId++;
}

mockedIntervalClear = function (id) {
    const idx = intervalHandlers.findIndex(handler => {
        return handler.id === id;
    });
    if (idx >= 0) {
        intervalHandlers.splice(idx, 1);
    }
}

function flushIntervalHandlers() {
    // Copy the array. In case setInterval/clearInterval is invoked in the callback.
    const savedIntervalHandlers = intervalHandlers.slice();
    for (let i = 0; i < savedIntervalHandlers.length; i++) {
        const handler = savedIntervalHandlers[i];
        if (handler.frame === frameIdx) {
            try {
                handler.callback();
            }
            catch (e) {
                // Catch error to avoid following tasks.
                // __VRT_LOG_ERRORS__(e.toString());
            }
            handler.frame += handler.intervalFrame;
        }
    }
}

/** Mock Date */

const NativeDate = window.Date;

const mockNow = function () {
    // // Use same time in one frame.
    // var realFrameTime = NativeDate.now();
    // // Split frame. Add 8ms offset on the second half
    // // Avoid infinite loop when some logic determine whether to break the loop based on the execution time.
    // // For example https://github.com/apache/echarts/blob/737e23c0054e6b501ecc6f562920cffae953b5c6/src/core/echarts.ts#L537
    // var frameDeltaTime = realFrameTime - realFrameStartTime;
    var frameDeltaTime = 0;
    // Use same time in one frame.
    return TIMELINE_START + (timelineTime + frameDeltaTime) * window.__VRT_PLAYBACK_SPEED__;
};
function MockDate(...args) {
    if (!args.length) {
        return new NativeDate(mockNow());
    }
    else {
        return new NativeDate(...args);
    }
}
MockDate.prototype = Object.create(NativeDate.prototype);
Object.setPrototypeOf(MockDate, NativeDate);

let rafCb = null;

window.requestAnimationFrame = function (cb) {
    if (isMocking) {
        mockedRaf(cb);
        if (typeof rafCb === 'function') {
            rafCb(fixedFrameTime);
        }
    }
    else {
        nativeRaf(cb);
    }
};

export function setFixedFrameRate(fps: number) {
    fixedFrameTime = fps > 0 ? 1000 / fps : 16;
}

export function startMock(frameCb) {
    isMocking = true;
    window.setTimeout = mockedTimeout;
    window.setInterval = mockedInterval;
    window.clearTimeout = mockedTimeoutClear;
    window.clearInterval = mockedIntervalClear;
    (MockDate as any).now = mockNow;
    window.Date = MockDate;
    rafCbs = [];
    frameIdx = 0;
    timelineTime = 0;
    rafCb = frameCb;
    nativeRaf(timelineLoop);
}

export function stopMock() {
    isMocking = false;
    rafCb = null;
    window.requestAnimationFrame = nativeRaf;
    window.setTimeout = nativeSetTimeout;
    window.setInterval = nativeSetInterval;
    window.clearTimeout = nativeClearTimeout;
    window.clearInterval = nativeClearInterval;
    window.Date = nativeDate;
}

export { nativeRaf, nativeSetInterval, nativeSetTimeout };
