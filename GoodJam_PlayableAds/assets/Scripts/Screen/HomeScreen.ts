import { _decorator, Component, EffectAsset, Node } from 'cc';
import { ScreenBase } from './ScreenBase';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { GameManager } from '../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('HomeScreen')
export class HomeScreen extends ScreenBase {
    
    @property(Node)
    nodeTapToPlay: Node = null;
}


