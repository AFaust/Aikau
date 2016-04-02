/**
 * Copyright (C) 2005-2016 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @module alfresco/core/BaseWidget
 * @extends module:dijit/_WidgetBase
 * @mixes module:alfresco/core/Core
 * @author Axel Faust
 * @since 1.0.6x
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "alfresco/core/Core",
        "dojo/has"], function(declare, _WidgetBase, Core, has) {
    
    // check if we run on IE so we don't activate our preemptive 2.0 empty behaviour (to improve performance)
    // see https://bugs.dojotoolkit.org/ticket/16957
    // newer (unaffected) IEs are reported as either trident or edge
    var isEmptyLeakAffected = has('ie');
    
    return declare([_WidgetBase, Core], {
        
        /**
         * This keeps track of wether this instances DOM node is attached to the live DOM tree.
         *
         * @instance
         * @type {boolean}
         * @default false
         */
        _attachedToLiveDOM: false,
        
        /**
         * This is an extension point for handling the attachment of this instances DOM node from the live DOM tree.
         * Overriding functions MUST call "inherited".
         *
         * @extensionPoint
         * @instance
         */
        attachedToLiveDOM: function alfresco_core_BaseWidget__attachedToLiveDOM() {
            this._attachedToLiveDOM = true;
        },
        
        /**
         * This is an extension point for handling the detachment of this instances DOM node from the live DOM tree.
         * Overriding functions MUST call "inherited".
         *
         * @extensionPoint
         * @instance
         */
        detachedFromLiveDOM: function alfresco_core_BaseWidget__detachedFromLiveDOM() {
            this._attachedToLiveDOM = false;
        },
        
        /**
         * Overriden function to ensure this instances DOM node is detached from the live DOM tree before its actual destruction.
         * 
         * @instance
         */
        destroy: function alfresco_core_BaseWidget__destroy(preserveDom) {
            // avoid doing the full destruction while attached to the live DOM
            if (this._attachedToLiveDOM === true && this.domNode && document.body.contains(this.domNode))
            {
                this.domNode.parentNode.removeChild(this.domNode);
                this.detachedFromLiveDOM();
            }
            
            this.inherited(arguments);
        },
        
        /**
         * Overriden function to ensure this instances DOM node is detached from the live DOM tree before its actual destruction.
         * 
         * @instance
         */
        destroyRecursive: function alfresco_core_BaseWidget__destroyRecursive(preserveDom) {
            // avoid doing the full destruction while attached to the live DOM
            if (this._attachedToLiveDOM === true && this.domNode && document.body.contains(this.domNode))
            {
                this.domNode.parentNode.removeChild(this.domNode);
                this.detachedFromLiveDOM();
            }
            
            this.inherited(arguments);
        },
        
        /**
         * Overriden function to avoid applying the default domConstruct.empty behaviour in browsers that are not affected by DOM-related memory leaks.
         * 
         * @instance
         */
        destroyRendering: function alfresco_core_BaseWidget__destroyRendering(preserveDom) {
            var domNode;
            if (!isEmptyLeakAffected)
            {
                // for performance we want to avoid the default domConstruct.empty behaviour using innerHTML to address a memory leak in old IE
                domNode = this.domNode;
                delete this.domNode;
                
                this.inherited(arguments);
                
                // now do what domConstruct.empty would have done
                if (domNode !== undefined && domNode !== null)
                {
                    if (preserveDom === true)
                    {
                        domAttr.remove(domNode, 'widgetId');
                    }
                    else
                    {
                        while (domNode.lastChild)
                        {
                            domNode.removeChild(domNode.lastChild);
                        }

                        if (domNode.parentNode)
                        {
                            domNode.parentNode.removeChild(domNode);
                        }
                    }
                }
            }
            else
            {
                this.inherited(arguments);
            }
        }
        
    });
});