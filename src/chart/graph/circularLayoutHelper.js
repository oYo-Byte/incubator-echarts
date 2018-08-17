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

import * as vec2 from 'zrender/src/core/vector';

export function circularLayout(seriesModel) {
    var coordSys = seriesModel.coordinateSystem;

    if (coordSys && coordSys.type !== 'view') {
        return;
    }

    var rect = coordSys.getBoundingRect();
    var nodeData = seriesModel.getData();
    var graph = nodeData.graph;
    var angle = 0;
    var sum = nodeData.getSum('value');
    var unitAngle = Math.PI * 2 / (sum || nodeData.count());
    var cx = rect.width / 2 + rect.x;
    var cy = rect.height / 2 + rect.y;
    var r = Math.min(rect.width, rect.height) / 2;
    var radianToAngle = Math.PI / 180;
    var adjustAngle = 90 * radianToAngle;
    graph.eachNode(function (node) {
        var value = node.getValue('value');
        angle += unitAngle * (sum ? value : 1) / 2 + adjustAngle;
        node.setLayout([r * Math.cos(angle) + cx, r * Math.sin(angle) + cy]);
        angle += unitAngle * (sum ? value : 1) / 2 - adjustAngle;
    });
    nodeData.setLayout({
        cx: cx,
        cy: cy
    });
    graph.eachEdge(function (edge) {
        var curveness = edge.getModel().get('lineStyle.curveness') || 0;
        var p1 = vec2.clone(edge.node1.getLayout());
        var p2 = vec2.clone(edge.node2.getLayout());
        var cp1, cpx, cpy;
        var x12 = (p1[0] + p2[0]) / 2;
        var y12 = (p1[1] + p2[1]) / 2;
        if (+curveness) {
            curveness = Number(curveness);
            var xDistance = Math.abs(p1[0] - p2[0]);
            var yDistance = Math.abs(p1[1] - p2[1]);
            var hypotenuse = Math.sqrt((Math.pow(xDistance, 2) + Math.pow(yDistance, 2)));
            var tempHypotenuse = Math.sqrt(2) * hypotenuse / 2;
            var ax, ay, x, y, angle, tempAngle;
            angle = Math.atan(yDistance / xDistance);
            var scale = hypotenuse / 2 * (1 + curveness);
            if (p1[0] >= p2[0] && p1[1] >= p2[1]) {
                x = Math.sin(angle) * scale;
                y = Math.cos(angle) * scale;
                if (xDistance > yDistance) {
                    tempAngle = 45 * radianToAngle + angle;
                    ax = p1[0] - Math.sin(tempAngle) * tempHypotenuse;
                    ay = p1[1] + Math.cos(tempAngle) * tempHypotenuse;
                } else {
                    tempAngle = 135 * radianToAngle - angle;
                    ax = p1[0] - Math.sin(tempAngle) * tempHypotenuse;
                    ay = p1[1] - Math.cos(tempAngle) * tempHypotenuse;
                }
                cpx = ax + x;
                cpy = ay - y;
            } else if (p1[0] <= p2[0] && p1[1] >= p2[1]) {
                x = Math.sin(angle) * scale;
                y = Math.cos(angle) * scale;
                if (xDistance > yDistance) {
                    tempAngle = 45 * radianToAngle - angle;
                    ax = p1[0] + Math.sin(tempAngle) * tempHypotenuse;
                    ay = p1[1] - Math.cos(tempAngle) * tempHypotenuse;
                } else {
                    tempAngle = 135 * radianToAngle - angle;
                    ax = p1[0] - Math.cos(tempAngle) * tempHypotenuse;
                    ay = p1[1] - Math.sin(tempAngle) * tempHypotenuse;
                }
                cpx = ax + x;
                cpy = ay + y;
            } else if (p1[0] <= p2[0] && p1[1] <= p2[1]) {
                x = Math.sin(angle) * scale;
                y = Math.cos(angle) * scale;
                if (xDistance > yDistance) {
                    tempAngle = 45 * radianToAngle + angle;
                    ax = p1[0] + Math.sin(tempAngle) * tempHypotenuse;
                    ay = p1[1] - Math.cos(tempAngle) * tempHypotenuse;
                } else {
                    tempAngle = angle - 45 * radianToAngle;
                    ax = p1[0] + Math.cos(tempAngle) * tempHypotenuse;
                    ay = p1[1] + Math.sin(tempAngle) * tempHypotenuse;
                }
                cpx = ax - x;
                cpy = ay + y;
            } else if (p1[0] >= p2[0] && p1[1] <= p2[1]) {
                x = Math.sin(angle) * scale;
                y = Math.cos(angle) * scale;
                if (xDistance > yDistance){
                    tempAngle = 45 * radianToAngle + angle;
                    ax = p1[0] - Math.cos(tempAngle) * tempHypotenuse;
                    ay = p1[1] + Math.sin(tempAngle) * tempHypotenuse;
                } else {
                    tempAngle = 135 * radianToAngle - angle;
                    ax = p1[0] + Math.cos(tempAngle) * tempHypotenuse;
                    ay = p1[1] + Math.sin(tempAngle) * tempHypotenuse;
                }
                cpx = ax - x;
                cpy = ay - y;
            } else {
                angle = Math.atan(xDistance / yDistance);
                tempAngle = 135 * radianToAngle - angle;
                x = Math.cos(angle) * scale;
                y = Math.sin(angle) * scale;
                if (curveness < 0) {
                    ax = p1[0] - Math.sin(tempAngle) * tempHypotenuse;
                    ay = p1[1] + Math.cos(tempAngle) * tempHypotenuse;
                } else {
                    ax = p2[0] - Math.sin(tempAngle) * tempHypotenuse;
                    ay = p2[1] + Math.cos(tempAngle) * tempHypotenuse;
                }
                cpx = ax + x;
                cpy = ay - y;
            }
            cp1 = [cpx, cpy];
        }

        edge.setLayout([p1, p2, cp1]);
    });
}
