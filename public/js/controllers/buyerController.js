angular.module('buyerController', ['allProjectsFactory'])

  .controller('buyerCtrl', buyerCtrl)

  buyerCtrl.$inject = ['$http', 'allProjects'];
  function buyerCtrl($http, allProjects){
    var self = this;
    console.log('Buyer controller');

    //////counter to keep track of active or curated list being shown
    self.curatedToggleCounter = 'active'
    self.collectionCounter = true;///so we only load collections once

    /////////////////////////////////////////////////////
    /////////onload event to add initial list of repeated projects

    function loadProjects(callback, arg){
      ///////decode user to pull data
      $http({
        method: "GET"
        ,url: '/api/checkstatus/'+ window.localStorage.hofbToken
      })
      .then(function(decodedToken){
        console.log(decodedToken);
        var tier = decodedToken.data.aud.split("-")[1];
        console.log(tier);
        self.buyerId = decodedToken.data.name;
        getBoughtList();/////run on load in order for list to be set on toggle
        if(decodedToken.data.aud.split('-')[0] != "buyer"){
          window.location.hash = '#/signin'
        }
        $http({
          method: "GET"
          ,url: '/api/buyer/products/'+tier
        })
        .then(function(products){
          console.log(products);
          var allProjects = products.data;
          var allProjectsAlreadyCurated = [];
          for (var i = 0; i < allProjects.length; i++) {
            if(allProjects[i].status == "curated"){
              allProjectsAlreadyCurated.push(allProjects[i]);
            }
            self.alreadyCurated = allProjectsAlreadyCurated;
            console.log(self.alreadyCurated);
          }
          //////add time-since-creation field
          var collectionName = ["All"];
          for (var i = 0; i < self.alreadyCurated.length; i++) {
            function timeSince(){
              var nowDate = new Date();
              var timeProj = self.alreadyCurated[i].timestamp;
              var projYear = timeProj.split('-')[0];
              var projMonth = timeProj.split('-')[1];
              var projDay = timeProj.split('-')[2];
              var yearsSince = nowDate.getFullYear() - projYear;
              var monthsSince = nowDate.getMonth() - projMonth;
              var daysSince = nowDate.getDate() - projDay;
              if(yearsSince > 0){
                return yearsSince+" years";
              }
              else if(monthsSince > 0){
                return monthsSince+" months";
              }
              else if(daysSince > 0 ){
                return daysSince+" days"
              } else {
                return "Less Than 1 day";
              }
            }
            self.alreadyCurated[i].TimeSinceCreation = timeSince();
          }
          callback(arg)
        })
      })
    }

    /////load all active projects into the dashboard view
    function loadInitialList(arg){
      for (var i = 0; i < self.alreadyCurated.length; i++) {
        if(((i+1)%6) != 0 || i == 0){
          $('.designerDashList').append(
            "<div class='col-md-2 col-xs-12 projectCell'>"+
              "<div class='projectCellInner'>"+
                "<div class='projectCellImageHolder'>"+
                  "<img class='projectCellImage' id='"+self.alreadyCurated[i]._id+"'"+
                "src='"+self.alreadyCurated[i].images[0]+"'>"+
                "</div>"+
                "<div class='projectCellContent'>"+
                  "<p>"+self.alreadyCurated[i].TimeSinceCreation+"</p>"+
                  "<p>"+self.alreadyCurated[i].name+"</p>"+
                "</div>"+
              "</div>"+
            "</div>"
          )
        }
        else if (((i+1)%6) == 0 && i != 0){
          $('.designerDashList').append(
            "<div class='blankDiv projectCell col-md-2 col-xs-0'>"+
            "</div>"
          )
        }
      }
      $('.designerDashList').append(
        "<div class='col-md-2 col-xs-12 projectCell projectCellNew'>"+
          "<div class='projectCellNewInner'>"+
            "<p>Build a New product</p>"+
          "</div>"+
        "</div>"
      )
      //////add hover events to 'addNew' box
      $('.projectCellNewInner').on('mouseenter', function(){
        $('.projectCellNewInner').animate({
          opacity: .6
        }, 100)
      })
      $('.projectCellNewInner').on('mouseleave', function(){
        $('.projectCellNewInner').animate({
          outline: 'none'
          ,opacity: 1
        }, 100)
      })
      $('.projectCellNewInner').on('click', function(){
        window.location.hash = "#/create/project";
        window.location.reload();
      })
      arg();
    }
    ///////will set self.allProjects as all our projects
    loadProjects(loadInitialList, addHoverToCell);

    ////function for appending active list
    function loadBoughtList(){
      console.log('going for it');
      var buyerId = self.buyerId;
      console.log(self.boughtProducts);
      for (var i = 0; i < self.boughtProducts.length; i++) {
        function timeSince(){
          var nowDate = new Date();
          var timeProj = self.boughtProducts[i].timestamp;
          var projYear = timeProj.split('-')[0];
          var projMonth = timeProj.split('-')[1];
          var projDay = timeProj.split('-')[2];
          var yearsSince = nowDate.getFullYear() - projYear;
          var monthsSince = nowDate.getMonth() - projMonth;
          var daysSince = nowDate.getDate() - projDay;
          if(yearsSince > 0){
            return yearsSince+" years";
          }
          else if(monthsSince > 0){
            return monthsSince+" months";
          }
          else if(daysSince > 0 ){
            return daysSince+" days"
          } else {
            return "Less Than 1 day";
          }
        }
        self.boughtProducts[i].TimeSinceCreation = timeSince();
      }
      for (var i = 0; i < self.boughtProducts.length; i++) {
        if(((i+1)%6) != 0 || i == 0){
          $('.designerDashList').append(
            "<div class='projectCell col-md-2 col-xs-12'>"+
              "<div class='projectCellInner'>"+
                "<div class='projectCellImageHolder'>"+
                  "<img class='projectCellImage' src='"+self.boughtProducts[i].images[0]+"'>"+
                "</div>"+
                "<div class='projectCellContent'>"+
                  "<p>"+self.boughtProducts[i].TimeSinceCreation+"</p>"+
                  "<p>"+self.boughtProducts[i].name+"--bought</p>"+
                "</div>"+
              "</div>"+
            "</div>"
          )
        }
        else if (((i+1)%6) == 0 && i != 0){
          $('.designerDashList').append(
            "<div class='blankDiv projectCell col-md-2 col-xs-0'>"+
            "</div>"
          )
        }
      }
      $('.designerDashList').append(
        "<div class='col-md-2 col-xs-12 projectCell projectCellNew'>"+
          "<div class='projectCellNewInner'>"+
            "<p>Build a New product</p>"+
          "</div>"+
        "</div>"
      )
      $('.projectCellNewInner').on('mouseenter', function(){
        $('.projectCellNewInner').animate({
          opacity: .6
        }, 100)
      })
      $('.projectCellNewInner').on('mouseleave', function(){
        $('.projectCellNewInner').animate({
          outline: 'none'
          ,opacity: 1
        }, 100)
      })
      $('.projectCellNewInner').on('click', function(){
        window.location.hash = "#/create/project";
        window.location.reload();
      })
    }
    function getBoughtList(){
      console.log(self.buyerId);
      $http({
        method: "GET"
        ,url: "/api/bought/products/"+ self.buyerId
      })
      .then(function(boughtProducts){
        console.log(boughtProducts);
        self.boughtProducts = boughtProducts.data;
      })
    }

    ////function for appending filtered lists from dropdown in realtime
    function loadFilteredList(filterType, filterValue, listToFilter){
      var productData = listToFilter[0];
      var productElemType = productData[filterType];///return string or array
      var filteredArray = [];
        //////check for filters with one value versus many
      if(typeof(productElemType) == 'string'){
        for (var i = 0; i < listToFilter.length; i++) {
          var productTypeData = listToFilter[i];
          var productType = productTypeData[filterType];
          ///adding for loop here
          if(filterValue == productType){
            filteredArray.push(listToFilter[i]);
          }
          ////ending for loop
        }
        self.filteredProjects = filteredArray;
      }
      ////filter for attributes that come in arrays
      else if(typeof(productElemType) == 'object'){
        for (var i = 0; i < listToFilter.length; i++) {
          var productDataArray = listToFilter[i];
          var productTypeArray = productDataArray[filterType];
          for (var j = 0; j < productTypeArray.length; j++) {
            if(productTypeArray[j] == filterValue){
              filteredArray.push(listToFilter[i]);
              self.filteredProjects = filteredArray;
            }else{
            }
          }
        }
      }
      //////begin if statement for self.filtered
      if(!self.filteredProjects || self.filteredProjects.length == 0){
        console.log('no hits for that filter');
        $('.designerDashList').html('');
      }
      else {
        console.log(self.filteredProjects);
        console.log('trying to do something');
        for (var i = 0; i < self.filteredProjects.length; i++) {
          function timeSince(){
            var nowDate = new Date();
            var timeProj = self.filteredProjects[i].timestamp;
            var projYear = timeProj.split('-')[0];
            var projMonth = timeProj.split('-')[1];
            var projDay = timeProj.split('-')[2];
            var yearsSince = nowDate.getFullYear() - projYear;
            var monthsSince = nowDate.getMonth() - projMonth;
            var daysSince = nowDate.getDate() - projDay;
            if(yearsSince > 0){
              return yearsSince+" years";
            }
            else if(monthsSince > 0){
              return monthsSince+" months";
            }
            else if(daysSince > 0 ){
              return daysSince+" days"
            } else {
              return "Less Than 1 day";
            }
          }
          self.filteredProjects[i].TimeSinceCreation = timeSince();
        }
        for (var i = 0; i < self.filteredProjects.length; i++) {
          if(((i+1)%6) != 0 || i == 0){
            $('.designerDashList').append(
              "<div class='projectCell col-md-2 col-xs-12'>"+
                "<div class='projectCellInner'>"+
                  "<div class='projectCellImageHolder'>"+
                    "<img class='projectCellImage' src='"+self.filteredProjects[i].images[0]+"'>"+
                  "</div>"+
                  "<div class='projectCellContent'>"+
                    "<p>"+self.filteredProjects[i].TimeSinceCreation+"</p>"+
                    "<p>"+self.filteredProjects[i].name+"</p>"+
                  "</div>"+
                "</div>"+
              "</div>"
            )
          }
          else if (((i+1)%6) == 0 && i != 0){
            $('.designerDashList').append(
              "<div class='blankDiv projectCell col-md-2 col-xs-0'>"+
              "</div>"
            )
          }
        }
      //////end if statement for self.filtered
      }
      $('.designerDashList').append(
        "<div class='col-md-2 col-xs-12 projectCell projectCellNew'>"+
          "<div class='projectCellNewInner'>"+
            "<p>Build a New product</p>"+
          "</div>"+
        "</div>"
      )
      //////add hover events to 'addNew' box
      $('.projectCellNewInner').on('mouseenter', function(){
        $('.projectCellNewInner').animate({
          opacity: .6
        }, 100)
      })
      $('.projectCellNewInner').on('mouseleave', function(){
        $('.projectCellNewInner').animate({
          outline: 'none'
          ,opacity: 1
        }, 100)
      })
      $('.projectCellNewInner').on('click', function(){
        window.location.hash = "#/create/project";
        window.location.reload();
      })
      addHoverToCell();
      self.filteredProjects = [];
    }


    ///////////////////////////
    //////Toggle Logic/////////

    ////see all curated projects
    function toggleCurated(){
      $('.designerDashList').html('');
      loadBoughtList();
      $('.sectionTitle').text('listing all bought projects')
    }

    ////see all active projects
    function toggleActive(){
      $('.designerDashList').html('');
      loadInitialList(function(){console.log('boom')});
      $('.sectionTitle').text('listing all active projects')
    }

    /////////////////////////////////////////////////////////
    //////////click functions for toggling designer dashboard

    ////////toggle to curated view
    $('.designerDashCurated').on('click', function(){
      $('.designerDashCurated').css({
        backgroundColor: "#F9F7F5"
      })
      $('.designerDashActive').css({
        backgroundColor: "#EBEBE9"
      })
      self.curatedToggleCounter = 'curated';
      toggleCurated();
      addHoverToCell();
    })

    ////////toggle to active view
    $('.designerDashActive').on('click', function(){
      $('.designerDashCurated').css({
        backgroundColor: "#EBEBE9"
      })
      $('.designerDashActive').css({
        backgroundColor: "#F9F7F5"
      })
      self.curatedToggleCounter = 'active';
      toggleActive();
      addHoverToCell();
    })
    //////////click functions for toggling designer dashboard
    /////////////////////////////////////////////////////////

    //////End Toggle Logic/////
    ///////////////////////////

    /////////////////////////////
    /////////Cell Hover effect///

    function addHoverToCell(){
      /////create mouseenter event listener to cause frontend changes
      $('.projectCellImage').on('mouseenter', function(evt){
        var $hoverTarget = $(evt.target);
        $hoverTarget.css({
          opacity: 0.5
        })
        console.log($(evt.target)[0].id);
        ////we drill up in order to get the parent, so we can append the html buttons to it
        var parentContainer = $hoverTarget.parent().parent()[0];
        $(parentContainer).prepend(
          "<div class='projectCellHoverContainer' id='"+$(evt.target)[0].id+"'>"+
            "<div class='projectCellTrash'>X </div>"+
            '<div class="projectCellButton" id="projectCellButtonEdit">Edit</div>"'+
          "</div>"
        )
        $('#projectCellButtonEdit').on('click', function(evt){
          var prodIdToUpdate = $($(evt.target)[0].parentNode)[0].id;
          console.log($($(evt.target)[0].parentNode)[0].id);
          $('.bodyview').prepend(
            '<div class="curatePopup">'+
              "<h2>Purchase or request a sample?</h2>"+
              "<br>"+
              '<button>no thanks</button>'+
              '<button class="addToPurchased bought" id="'+prodIdToUpdate+'">Purchase an order</button>'+
              '<button class="addToPurchased sample" id="'+prodIdToUpdate+'">Request a Sample</button>'+
            '</div>'
          )
          $('.addToPurchased').on('click', function(evt){
            var prodId = $(evt.target)[0].id;
            console.log($(evt.target)[0].classList[1]);
            var purchaseType = $(evt.target)[0].classList[1];
            var purchaserInformation = [{"purchaserId": self.buyerId, "companyName":"Dummy Company"}]
            $http({
              method: "POST"
              ,url: "/api/product/update"
              ,data: {status: purchaseType, projectId: prodId, purchaserInformation: purchaserInformation}
            })
            .then(function(err, updatedProduct){
              if(err){console.log(err)}
              if (updatedProduct) {
                // window.location.reload();
                console.log(updatedProduct);
              }
            })
          })
        })
        $('.projectCellTrash').on('click', function(){
          var product = $(parentContainer);
          var productId = $($(product[0].children[1])[0].children[0])[0].id
          $('.bodyview').prepend(
            '<div class="designerDashDeleteProduct col-md-4 col-md-offset-4 col-xs-8 col-xs-offset-2">'+
              "<p>Are you sure you want to delete this product?</p>"+
              "<button class='deleteButton'>No</button>"+
              "<button id='"+productId+"' class='deleteButton'>Yes</button>"+
            "</div>"
          )
          $('.deleteButton').on('click', function(evt){
            var idToDelete = $(evt.target)[0].id;
            $http({
              method: "DELETE"
              ,url: "/api/product/"+idToDelete
            })
            .then(function(deletedObject){
              /////reload cells
              $('.designerDashList').html('');
              loadProjects(loadInitialList, addHoverToCell)
              $('.designerDashDeleteProduct').remove();
            })
          })
        })
        $('.projectCellHoverContainer').on('mouseleave', function(evt){
          $hoverTarget.css({
            opacity: 1
          })
          ////we drill up in order to get the parent, so we can append the html buttons to it
          // var parentContainer = $hoverTarget.parent().parent()[0];
          $('.projectCellHoverContainer').remove();
        })
      })
      //////function to restore cell to order when mouse leaves cell
    }

    ////////End Cell Hover///////
    /////////////////////////////

    ////////////////////////////////
    //////Begin Filtering///////////

    ////filter by productType
    $('.designerDashProductType').change(function(evt){
      $('.designerDashList').html('');
      if(self.curatedToggleCounter == 'active'){
        loadFilteredList("productType", $('.designerDashProductType').val(), self.alreadyCurated);
      }
      else if(self.curatedToggleCounter == 'curated'){
        loadFilteredList("productType", $('.designerDashProductType').val(), self.boughtProjects);
      }
    })

    ////filter by color
    $('.designerDashColor').change(function(){
      $('.designerDashList').html('');
      if(self.curatedToggleCounter == 'active'){
        loadFilteredList("colors", $('.designerDashColor').val(), self.alreadyCurated);
      }
      else if(self.curatedToggleCounter == 'curated'){
        loadFilteredList("colors", $('.designerDashColor').val(), self.boughtProjects);
      }
    })

    ////filter by fabric
    $('.designerDashFabric').change(function(){
      console.log('looooo testing');
      $('.designerDashList').html('');
      if(self.curatedToggleCounter == 'active'){
        loadFilteredList("fabrics", $('.designerDashFabric').val(), self.alreadyCurated);
      }
      else if(self.curatedToggleCounter == 'curated'){
        loadFilteredList("fabrics", $('.designerDashFabric').val(), self.boughtProjects);
      }
    })

    ////filter by button
    // $('.designerDashButton').change(function(){
    //   $('.designerDashList').html('');
    //   loadFilteredList("buttons", $('.designerDashButton').val())
    // })

    ////filter by season
    $('.designerDashSeason').change(function(){
      $('.designerDashList').html('');
      if(self.curatedToggleCounter == 'active'){
        loadFilteredList("seasons", $('.designerDashSeason').val(), self.alreadyCurated);
      }
      else if(self.curatedToggleCounter == 'curated'){
        loadFilteredList("seasons", $('.designerDashSeason').val(), self.boughtProjects);
      }
    })
    ////End Filtering///////////////
    ////////////////////////////////

    ///logout button functionality
    $('.logoutButton').on('click', function(){
      window.localStorage.hofbToken = "";
      window.location.hash = "#/signin"
    })

    ///////////////////////
    //////load collections/
    function loadCollection(collections){
      self.collectionCounter = false;///so that we only load collections once
      for (var i = 0; i < collections.length; i++) {

        $('.designerDashCollectionDropdown').append(
          '<div class="designerDashCollectionCell" id="'+collections[i]+'">'+
            // "<p>"+
            collections[i]+
            // "</p>"+
          "</div>"
        )
      }
      $('.designerDashCollectionCell').on('mouseenter', function(evt){
        // console.log(evt.target);
        // console.log($($(evt.target)[0]));
        var color = $(evt.target).css('backgroundColor');
        console.log(color);
        if( color != 'rgb(28, 28, 28)'){
          $($(evt.target)[0]).css({
              backgroundColor: '#BDBDBD'
          })
        }
      })
      $('.designerDashCollectionCell').on('mouseleave', function(evt){
        // console.log(evt.target);
        // console.log($($(evt.target)[0]));
        var color = $(evt.target).css('backgroundColor');
        console.log(color);
        console.log();
        if( color != 'rgb(28, 28, 28)'){
          $($(evt.target)[0]).css({
            backgroundColor: 'white'
            ,color: "black"
          })
        }
      })
      $('.designerDashCollectionCell').on('click', function(evt){
        var collections = $('.designerDashCollectionCell');
        console.log(collections);
        for (var i = 0; i < collections.length; i++) {
          $(collections[i]).css({
            backgroundColor: 'white'
            ,color: "black"
          })
        }
        var collectionValue = $($(evt.target)[0])[0].id;
        console.log(collectionValue);
        $($(evt.target)[0]).css({
          backgroundColor: "#1C1C1C"
          ,color: 'white'
        })
        if(self.curatedToggleCounter == 'active'){
          if(collectionValue == 'All'){
            $('.designerDashList').html("");
            loadProjects(loadInitialList, addHoverToCell);
          }
          else {
            $('.designerDashList').html("");
            loadFilteredList('collections', collectionValue, self.alreadyCurated);
          }
        }
        else if(self.curatedToggleCounter == 'curated'){
          if(collectionValue == 'All'){
            $('.designerDashList').html("");
            loadboughtList();
          }
          else {
            $('.designerDashList').html("");
            loadFilteredList('collections', collectionValue, self.boughtProjects);
          }
        }

      })
    }
    //end load collections/
    ///////////////////////


    /////collection column logic


  /////end admin controller
  ////////////////////////
  ////////////////////////
  }
