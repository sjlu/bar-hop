var Foursquare;Foursquare=function(){function e(){var e;e=this.tokens[_.random(0,this.tokens.length-1)],this.key="client_id="+e.id+"&client_secret="+e.secret+"&v=20130407"}return e.prototype.category="4bf58dd8d48988d116941735",e.prototype.url="https://api.foursquare.com/v2/venues",e.prototype.oauth="ZN1EU0HVWFSKKSEAOYI4OZ3VWKZISEOA5U2TLBAIGJYIXLLB",e.prototype.tokens=[{id:"JT0GWZDB0MJPLMCYXVGGPSO5PKVWHU1KP5CJBWYTHOTNKRFM",secret:"VIHV5SJV0GEQENADWSLWDS3O2ET2GMCUCLHELFHYKUV0G2SY"},{id:"0GN4ZBT1UKVRMJEUDRKALEX1K1SKE5B0YCGOK1ASX50Z0N4D",secret:"LAUGEKOXA5EF0BAEF5EEWECJ5QIT4TWHGUX5TWPRYGFTNAK5"},{id:"LHTVMBRCPPSHVARXE1BZ5L1QH23TJAJFTUG2S3HDMC04Y5ZY",secret:"DWEWRSKTGITH2LNFG4DEWZZ0MJDNMGKVIROALDMTWR22S4ZO"},{id:"B1TY4U1YQJK0GPOE5UYVHWOKG02HKIMJVVQHVMUHITHWQFAU",secret:"040KWJXO1UYPLTCDQ2J14TEAM2KY0V5KS32WYIIGDLKXVIFQ"},{id:"1CPR5PG1YRWPJRR0ZDCNCSOCK4ELVJHAPRQHHEYB15YYDR5H",secret:"AIHBIUJIEGCL55WKPLCNAZDHJQ0TSVFOUFUF4OHAY5FXVD04"}],e.prototype.key="",e.prototype.build=function(){return this.key},e.prototype.fail=function(){return $("#error").show()},e.prototype.byLocation=function(e,t,n){var r,i,s,o,u,a=this;return s=0,i=[],r={},u=function(e){var t,i,s,o,u;i=[],o=function(t){i.push(t);if(i.length>=e.length)return n({first:r,next:i})},u=[];for(t in e)s=e[t],u.push(a.analyze(s,o));return u},o=function(e){i.push(e);if(i.length>=s)return i=_.filter(i,function(e){var t;return t=e.female/(e.female+e.male),t>.35?!0:!1}),r=i[_.random(0,i.length-1)],a.follow(r.venue,u)},$.ajax(""+this.url+"/search?ll="+e+","+t+"&categoryId="+this.category+"&"+this.build(),{type:"GET",dataType:"json",error:this.fail,success:function(e){var t,n,r,i;s=e.response.venues.length,r=e.response.venues,i=[];for(t in r)n=r[t],i.push(a.analyze(n,o));return i}})},e.prototype.byVenue=function(e,t){var n,r=this;return n=function(e){var n,i,s,o,u;i=[],o=function(n){i.push(n);if(i.length>=e.length)return t({next:i})},u=[];for(n in e)s=e[n],u.push(r.analyze(s,o));return u},this.follow(e,n)},e.prototype.analyze=function(e,t){var n,r,i;return r=0,i=[],n=function(n){var s,o,u,a,f;if(n!=null)for(o in n)u=n[o],i.push({id:u.user.id,gender:u.user.gender});r++;if(r===3){i=_.unique(i,function(e){return e.id}),a=0,s=0;for(o in i){f=i[o];switch(f.gender){case"male":a++;break;case"female":s++}}return t({venue:e,male:a,female:s})}},$.ajax(""+this.url+"/"+e.id+"?"+this.build(),{type:"GET",dataType:"json",error:this.fail,success:function(t){var r;return t=t.response.venue,e.rating=t.rating,t.hours!=null&&(e.open=t.hours.isOpen,r=_.find(t.hours.timeframes,function(e){return e.includesToday!=null?!0:!1}),r!=null&&r.open!=null&&(r=r.open[0].renderedTime.split("–"),r=r[1],e.openUntil=r)),t.popular!=null&&(e.open==null&&(e.open=t.popular.isOpen),e.popularHours=_.find(t.popular.timeframes,function(e){return e.includesToday!=null?!0:!1}),e.popularHours=e.popularHours.open[0].renderedTime),t.price!=null&&(e.price=t.price.tier),n()}}),$.ajax(""+this.url+"/"+e.id+"/photos?sort=popular&limit=500&"+this.build(),{type:"GET",dataType:"json",error:this.fail,success:function(t){var r,i;return r=t.response.photos.items,i=""+r[0].prefix+"300x300"+r[0].suffix,e.photo=i,n(r)}}),$.ajax(""+this.url+"/"+e.id+"/tips?sort=popular&limit=500&"+this.build(),{type:"GET",dataType:"json",error:this.fail,success:function(e){var t;return t=e.response.tips.items,n(t)}})},e.prototype.follow=function(e,t){return $.ajax(""+this.url+"/"+e.id+"/nextvenues?"+this.build(),{type:"GET",dataType:"json",error:this.fail,success:function(e){var n;return n=e.response.nextVenues.items,n=_.filter(n,function(e){var t,n,r;r=e.categories;for(n in r){t=r[n];if(t.name.toLowerCase().indexOf("bar")!==-1)return!0}return!1}),t(n)}})},e}(),$(document).ready(function(){var e,t,n,r,i,s,o;return s=0,n=[],e=new Foursquare,o=function(){var e,t,r,i,s,o,u,a,f,l;console.log(n),f=$("#place").html(),l=Handlebars.compile(f),$("#loading").hide();for(i in n){o=n[i],s=null,o.venue.open?(s="Open",o.venue.openUntil&&(s+=" until "+o.venue.openUntil)):s="Closed",r=0,a="";while(r<o.venue.price)a+="$",r++;u="",o.venue.popularHours!=null&&(u=o.venue.popularHours.replace("-"," to ")),t={image:o.venue.photo,name:o.venue.name,location:""+o.venue.location.address+", "+o.venue.location.city+", "+o.venue.location.state,lat:o.venue.location.lat,lng:o.venue.location.lng,ratio:Math.round(o.female/(o.female+o.male)*100),rating:o.venue.rating,open:s,price:a,popular:u},$(".swipe-wrap").append(l(t))}return e=$("#nav li"),window.mySwipe=new Swipe(document.getElementById("slider"),{startSlide:0,speed:300,auto:0,continuous:!0,disableScroll:!0,stopPropagation:!1,callback:function(t){var n;n=e.length;while(n--)e[n].className=" ";return e[t].className="on"},transitionEnd:function(e,t){}}),$("#nav").show(),e.click(function(){return window.mySwipe.slide($(this).attr("data-num"),1e3)})},r=function(t){var i,u,a,f;t.next=_.sortBy(t.next,function(e){return-(e.female/(e.female+e.male))}),i=t.next[0],f=t.next;for(u in f)a=f[u],_.contains(n,t.next)||(i=a);return s<1&&n.push(t.first),n.push(i),s++,s<2?e.byVenue(i.venue,r):o()},i=function(t){return console.log(t),e.byLocation(t.lat,t.lng,r)},t=new Location(i)});var Location;Location=function(){function e(e){var t,n,r=this;n=function(t){return e({lat:t.coords.latitude,lng:t.coords.longitude})},t=function(){return e({lat:"40.739022",lng:"-73.98205"})},navigator.geolocation.getCurrentPosition(n,t)}return e.prototype.url="http://sjlu.cities.jit.su",e}();