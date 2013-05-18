/**
 * Created with JetBrains WebStorm.
 * User: 疯狂的蚂蚁
 * Date: 13-5-17
 * Time: 下午6:00
 * To change this template use File | Settings | File Templates.
 */
var Bootstrap = window.Bootstrap;
var messageBoxTemplate = [
    '<div class="messageBox-header">',
    '  {{view view.headerViewClass}}',
    '</div>',
    '<div class="messageBox-body">',
    '{{view view.bodyViewClass}}',
    '</div>',
    '{{#if view.isConfirm}}',
    '{{view view.confirmFoot}}',
    '{{/if}}',
    '{{#if view.isAlert}}',
    '{{view view.alertFoot}}',
    '{{/if}}'].join("\n");

var messageBoxFootTemplate = '<div class="btn btn-secondary" rel="secondary">' +
    '{{view.parentView.secondaryBtn}}'+
    '</div>'+
    '<div class="btn btn-primary" rel="primary">' +
    '{{view.parentView.primaryBtn}}'+
    '</div>';

Bootstrap.MessageBox = Em.View.extend({
    defaultTemplate : Ember.Handlebars.compile(messageBoxTemplate),
    classNameBindings: ['isModal:modal:message'],
    title : "",
    info : "",
    color : "green",
    messageIsError : false,
    isConfirm : false,
    isAlert : false,
    isModal : false,
    primaryBtn : "确定",
    secondaryBtn : "取消",
    messageBoxClass : function(){
      if(this.isAlert){
          return 'alert';
      }else if (this.isConfirm){
          return 'confirm';
      }else if(this.messageIsError){
          return 'errorMessage';
      }else {
          return 'message';
      }
    },
    headerViewClass: Ember.View.extend({
        template: Ember.Handlebars.compile('{{view.parentView.title}}')
    }),
    bodyViewClass : Em.View.extend({
        template: Em.Handlebars.compile('{{view.parentView.info}}')
    }),
    maskViewClass : null,
    confirmFoot : Em.View.extend({
        template : Em.Handlebars.compile(messageBoxFootTemplate),
        classNames : 'messageBox-foot'
    }),
    alertFoot : Em.View.extend({
        template : Em.Handlebars.compile('<div class="btn btn-primary" rel="primary">确定</div>'),
        classNames : 'messageBox-foot'
    }),
    /*isConfirmChanged : function(){
     alert("");
     }.observes('isConfirm'),*/

    click: function(event) {
        var target = event.target,
            targetRel = target.getAttribute('rel');
        if (targetRel === 'primary') {
            this._triggerCallbackAndDestroy({ primary: true }, event);
            return false;
        } else if (targetRel === 'secondary') {
            this._triggerCallbackAndDestroy({ secondary: true }, event);
            return false;
        }
    },
    didInsertElement:function(){
        var view = this.$();
        var body = view.children(".modal-body");
        var text = body.text().toString();
        body.text(text.slice(0,100) + "...");
        view.attr("tabindex",0);
        view.focus();
        if(this.isModal){
            var width = view.width();
            var height = view.height();
            var clientWidth = document.documentElement.clientWidth;
            var clientHeight = document.documentElement.clientHeight;
            //alert(clientHeight)
            view.offset({
                left : clientWidth / 2 - width / 2,
                top : clientHeight / 2 - height / 2
            }) ;
        }else{
            view.offset({
                top:0
            });
            view.css({'display' : 'none'})
            view.slideDown();
            var that = this;
            setTimeout(function(){
                view.slideUp(function(){
                    that.destroy();
                })
            },2000)
        }
    },
    _triggerCallbackAndDestroy: function(options, event) {
        var destroy;
        if (this.callback) {
            destroy = this.callback(options, event);
        }
        if (destroy === undefined || destroy) {
            this.destroy();
        }
        if(this.isConfirm){
            this.maskViewClass.destroy();
        }
        Bootstrap.MessageBox.modalIsShow = false;
    }
});
Bootstrap.MessageBox.reopenClass({
    rootElement: ".ember-application",
    modalIsShow : false,
    //调整参数
    adjustParam : function(param){
        if(param.isConfirm || param.isAlert){
            param.isModal = true;
        }
        if(param.isConfirm && param.isAlert){
            param.isAlert = false;
        }
        return param;
    },

    popup : function(options) {
        var messageBox, rootElement;
        if (!options) {
            options = {};
        }
        messageBox = this.create(this.adjustParam(options));
        rootElement = Ember.get(this, 'rootElement');
        if(options.isModal){
            if(!this.modalIsShow){
                this.modalIsShow = true;
                var maskViewClass = Em.View.create({
                    classNames : "modal-mask"
                });
                messageBox.maskViewClass = maskViewClass;
                messageBox.maskViewClass.appendTo(rootElement);
            }else{
                return null;
            }
        };
        messageBox.appendTo(rootElement);
        return messageBox;
    }
})