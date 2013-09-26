(function(out){

  var module = (function(){
    var namespace = {};

    function require(name){
      var m = namespace[name];
      return typeof m == 'object'?Object.create(m): m;
    }

    function isBlankObj(obj){
      return Obejct.keys(obj).length == 0;
    }

    function extend(target) {
      var source, key;
      source = Array.prototype.slice.call(arguments, 1);
      source.forEach(function(item){
        for( key in item ){
          target[key] = item[key];
        }
      });
      return target;
    }

    function createModule(){
      return {
        add: function(name, fn){
          var plat = {}, plate = {exports: plat};
          namespace[name] = {};
          fn(require, plat, plate);
          if(plate.exports == plat){
            extend(namespace[name], plat);
          } else {
            namespace[name] = plate.exports;
          }
        }, 
        run: function(fn){
          fn(require);
        }
      }
    }


    return {
      create: function(name){
        var m = createModule();
        namespace[name] = m;
        return m;
      }
    };
  })();

  out.module = module;

})(this['module'] ? module.exports: this);

