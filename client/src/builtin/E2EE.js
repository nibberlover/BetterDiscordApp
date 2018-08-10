/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher } from 'modules';
import { VueInjector, Reflection } from 'ui';
import EmoteComponent from './EmoteComponent.vue';
import aes256 from 'aes256';

export default new class E2EE extends BuiltinModule {

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    async enabled(e) {
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).after('render', this.render);
        MonkeyPatch('BD:E2EE', ctaComponent.component.prototype).before('handleSubmit', this.handleSubmit);
    }

    render(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));

        inner.props.children.splice(0, 0, VueInjector.createReactElement(EmoteComponent, {
            src: 'https://static-cdn.jtvnw.net/emoticons/v1/354/1.0',
            name: '4Head',
            hasWrapper: false
        }, true));
    }

    handleSubmit(component, args, retVal) {
        component.props.value = aes256.encrypt('randomkey', component.props.value);
    }

    disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
    }

}
