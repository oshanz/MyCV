function cvtips_search() {
   $('.unreal').each(function(e){
        n =  $(this);
        $('.real').each(function(i){ 
              if ( e == i ) {
                  $(this).val(n.val());
              }   
             });         
   });   
}
