(function($){
    $.fn.gradientStyler = function(options) {
		 //console.log"Created gradient styler");
		 
		 var settings = $.extend({
			// These are the defaults.
			
			//default gradient is comma separated list "color percent alpha" 
			defaultGradient: "#FFFFFF 0 1.0,#000000 1.0 1.0",
			gradientCSS:"",
			orientation: "horizontal",
			degrees:90,
			style: {},
			onChange: function(){
				
			},
			onDone: function(){
					
			}
		}, options );
		
		//an array that holds the points on the array
		//each index of this array holds a point with format [color,percentage,alpha,id]
		var gradientPoints = new Array();
		if(!settings.gradientCSS){
			gradientPoints = parseGradientString(settings.defaultGradient);
		}else{
			gradientPoints = parseGradientStringHTML5(settings.gradientCSS);	
		}
		sortGradientPoints();
		
		var $parentElement = $(this);
		var $holder;
		var $gradientDisplayDiv;
		var $handleHolder;
		var $colorPickerDiv;
		var $spectrumInput;
		var handleSelectedID;
		
		buildGradientStyler();
		
		function buildGradientStyler(){
			$holder = $('<div class="gradientStyler"></div>');	
			$parentElement.empty().append($holder);
			
			buildGradientDisplayDiv();
			buildHandleHolder();
			buildHandles();
			buildColorPicker();
			buildOrientationDropDown();
			//buildDoneButton();
			
		}
		
		function buildGradientDisplayDiv(){
			//builds the thin div that displays the preview gradient for the user
			$gradientDisplayDiv = $('<div class="gradientDisplayDiv"></div>');
			$holder.append($gradientDisplayDiv);
			$gradientDisplayDiv.on('click', function(e){
				userWantsToAddColor(e);
			})
			
			updatePreviewGradient();
		}
		
		function buildHandleHolder(){
			//builds handles to represent each colour point on the gradient
			$handleHolder =  $("<div></div>");
			$handleHolder.css({
				"position":"absolute",
				"top":parseFloat($gradientDisplayDiv.css("top")) + parseFloat($gradientDisplayDiv.css("height")) + "px",
				"left":parseFloat($gradientDisplayDiv.css("left")) +"px",
				"width":parseFloat($gradientDisplayDiv.width()) + 18 + "px",
				"height":"15px"
			});
			
			$holder.append($handleHolder);	
		}
		
		function buildColorPicker(){
			
			$colorPickerDiv = $("<div class='colorPicker'></div>");
			$holder.append($colorPickerDiv);
			//$colorPickerDiv.css("top", parseFloat($gradientDisplayDiv.css("top")) + $gradientDisplayDiv.height() + $handleHolder.height() + 3 + "px");
			$colorPickerDiv.css("top", parseFloat($gradientDisplayDiv.css("top")) + $gradientDisplayDiv.height() + "px");
			$colorPickerDiv.css("visibility", "hidden");
			$spectrumInput = $('<input type="text" class="gradientStylerSpectrum">');
			$colorPickerDiv.append($spectrumInput);
			$spectrumInput.spectrum({
				preferredFormat: "rgb",
				allowEmpty: false,
				showAlpha: true,
				showInput: true,
				change: function(color) {
					if(handleSelectedID){
						
						//console.log"Edit color for handle " + handleSelectedID);
						for(var i = 0; i<gradientPoints.length; i++){
							if(gradientPoints[i][3] == handleSelectedID){
								//set the hex color
								gradientPoints[i][0] = color.toHexString();
								
								//get the alpha if there is one
								var rgbArray = color.toRgbString().split(',');
								if(rgbArray.length == 3){
									//there is no alpha value
									gradientPoints[i][2] = "1.0";	
								}else{
									//there is an alpha value
									var alphaString = rgbArray[rgbArray.length - 1];
									alphaString = alphaString.trim();
									alphaString = alphaString.slice(0,-1);
									gradientPoints[i][2] = alphaString;
								}
								refreshGradientStyler();
									
							}
						}
					}
				}
			});
			
			
			var $deleteColorButton = $("<div class='deleteColorButton'></div>");
			$colorPickerDiv.append($deleteColorButton);
			$deleteColorButton.on("click", function(){
				//user would like to delete color
				//first check that there are more than two colors in array
				if(gradientPoints.length > 2){
					var indexToDelete;
					for(var i = 0; i<gradientPoints.length; i++){
						if(gradientPoints[i][3] == handleSelectedID){
							indexToDelete = i;	
						}
					}
					gradientPoints.splice(indexToDelete,1);
					refreshGradientStyler();	
				}else{
					SystemPopup.getInstance().showPopup({
						'type' : 'alert',
						'contentHeading' : 'System Message',
						'contentBody' : '<p>A gradient needs at least two colors.</p>'
					});

				}
			});
			
			var $xDiv = $("<div class='deleteX'>x</div>");
			$deleteColorButton.append($xDiv);
		}
		
		function refreshGradientStyler(){
			clearHandles();
			$gradientDisplayDiv.attr("style", "");
			$colorPickerDiv.css("visibility", "hidden");
			buildHandles();
			updatePreviewGradient();
			settings.onChange(buildGradientHTML5(), buildGradientCSS());
		}
		
		function buildHandles(){
			//adds the handles to the handle holder in the correct places
			for(var i = 0; i<gradientPoints.length; i++){
				var $handleDiv = $("<div handleID='" + gradientPoints[i][3] + "' class='gradientHandle'></div>");	
				$handleHolder.append($handleDiv)
				
				//$handleDiv.css("top", parseFloat($gradientDisplayDiv.css("top")) + parseFloat($gradientDisplayDiv.css("height")) + "px");
				$handleDiv.css("left", (parseFloat($gradientDisplayDiv.css("width")) * gradientPoints[i][1]) + "px");
				$handleDiv.css("background-color", hexToRgb(gradientPoints[i][0], gradientPoints[i][2]));
				
				$handleDiv.draggable({
					axis: 'x',
					containment: 'parent',
					drag: function() {
						
						$colorPickerDiv.css("visibility", "hidden");
						
						//the handle is being dragged, new percentage is where it is
						var newPercentage = Math.abs($(this).position().left + ($(this).width() * 0.5)) / $gradientDisplayDiv.width();
						//we need to update the gradient points array
						var idToCheck = $(this).attr("handleID");
						for(var e = 0; e<gradientPoints.length; e++){
							if(gradientPoints[e][3] == idToCheck){
								gradientPoints[e][1] = newPercentage;	
							}
						}
						sortGradientPoints();
						updatePreviewGradient();
						settings.onChange(buildGradientHTML5(), buildGradientCSS());
					}
				});
				
				$handleDiv.on('click', function(e){
					
					$colorPickerDiv.css("visibility", "visible");
					$colorPickerDiv.css("left", parseFloat($(e.target).css("left")) + parseFloat($handleHolder.css("left")) - 9 + "px");
					
					handleSelectedID = $(e.target).attr('handleID');
					
					//find the handle selected and set the spectrum color values
					for(var i = 0; i<gradientPoints.length; i++){
						if(handleSelectedID == gradientPoints[i][3]){
							var colorToSet = hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2]));
							//console.logcolorToSet);
							//console.log$.type(colorToSet));
							
							$holder.find(".gradientStylerSpectrum").val(colorToSet);		
							$holder.find(".gradientStylerSpectrum").spectrum('set', colorToSet);		
						
						}
					}
					
					$(document).on('click.forGrandientStyler', function(e){
						
						if($(e.target).attr("class")){
							if($(e.target).attr("class").indexOf("gradientHandle") == -1){
								$colorPickerDiv.css("visibility", "hidden");
								$(document).off('click.forGrandientStyler');
								handleSelectedID = null;
							}
						}else{
							$colorPickerDiv.css("visibility", "hidden");
							$(document).off('click.forGrandientStyler');
							handleSelectedID = null;	
						}
						
					})
					
				});
			}
		}
		
		function buildOrientationDropDown(){
			var $dropDownInput = $("<select class='gradientOrientationSelector'></select>");
			$dropDownInput.append('<option value="horizontal">Horizontal</option>');
			$dropDownInput.append('<option value="vertical">Vertical</option>');
			$dropDownInput.append('<option value="radial">Radial</option>');
			$dropDownInput.append('<option value="custom">Custom</option>');
			
			$holder.append($dropDownInput);
			
			$angleInput = $("<div class='gradientAngleDiv'><label style='width:auto'>Angle: </label><input type='number' class='gradientAngleInput' value='0'/></div>");
			$holder.append($angleInput);
			
			var self = this;
			
			$dropDownInput.on('change', function(){
				settings.orientation = $dropDownInput.val();
				
				$angleInput.css("visibility", "hidden");
				
				if($dropDownInput.val() == "horizontal"){
					settings.degrees = 90;	
				}else if($dropDownInput.val() == "vertical"){
					settings.degrees = 180;
				}else if($dropDownInput.val() == "custom"){
					settings.degrees = parseInt($angleInput.find(".gradientAngleInput").val()) + 90;	
					$angleInput.css("visibility", "visible");
				}
				settings.onChange(buildGradientHTML5(), buildGradientCSS());
				
			});
			
			$angleInput.find(".gradientAngleInput").on("change", function(){
				settings.degrees = parseInt($angleInput.find(".gradientAngleInput").val()) + 90;
				settings.onChange(buildGradientHTML5(), buildGradientCSS());
			});
		}
		
		function buildDoneButton(){
			$doneButton = $("<input class='gradientDoneButton' type='button' value='Apply'/>");
			$holder.append($doneButton);
			$doneButton.on('click', function(){
				settings.onDone(buildGradientHTML5(), buildGradientCSS());
			});	
		}
		
		function clearHandles(){
			$handleHolder.empty();	
		}
		
		function updatePreviewGradient(){
			//adds the correct css properties to the preview
			$gradientDisplayDiv.attr("style", buildGradientCSS(true));
			//settings.onChange(buildGradientHTML5(), buildGradientCSS());
		}
		
		function userWantsToAddColor(e){
			var leftOffset = $(e.target).offset().left;
			var clickPosition = e.pageX - leftOffset;
			var colorPosition = clickPosition / $gradientDisplayDiv.width(); 
			//console.log"Add color at " + colorPosition);
			
			//create an array to represent the new color point
			var newID = new Date().getTime();
			var newColorArray = [null, colorPosition, null, newID];
			//add the array to the gradient points
			gradientPoints.push(newColorArray);
			//sort the gradient points so the new color will be in the right position
			sortGradientPoints();
			
			//check to see which current color the new point is close to and make it that color
			var indexToCheck;
			for(var i = 0; i<gradientPoints.length; i++){
				if(gradientPoints[i][3] == newID){
					indexToCheck = i;	
				}
			}
			
			if(indexToCheck == 0){
				//this is the first color
				gradientPoints[indexToCheck][0] = gradientPoints[1][0];	
				gradientPoints[indexToCheck][2] = gradientPoints[1][2];	
			}else if(indexToCheck == gradientPoints.length - 1){
				//it's the last item in the array
				gradientPoints[indexToCheck][0] = gradientPoints[gradientPoints.length - 2][0];	
				gradientPoints[indexToCheck][2] = gradientPoints[gradientPoints.length - 2][2];
			}else{
				var colorBeforePercentage = gradientPoints[indexToCheck - 1][1];
				var colorAfterPercentage = gradientPoints[indexToCheck + 1][1];
				var difBefore = gradientPoints[indexToCheck][1] - colorBeforePercentage;
				var difAfter = colorAfterPercentage - gradientPoints[indexToCheck][1] ;
				
				//check if the difference before or after is less
				if(difBefore < difAfter){
					gradientPoints[indexToCheck][0]	= gradientPoints[indexToCheck - 1][0];
					gradientPoints[indexToCheck][2]	= gradientPoints[indexToCheck - 1][2];
				}else{
					gradientPoints[indexToCheck][0]	= gradientPoints[indexToCheck + 1][0];
					gradientPoints[indexToCheck][2]	= gradientPoints[indexToCheck + 1][2];	
				}
					
			}
			refreshGradientStyler();
		}
		
		function parseGradientString(gradientString){
			//takes a gradient in string form and turns it into an array
			var returnArray = new Array();
			var arrayOfGradientPoints = gradientString.split(",");
			for(var i = 0; i<arrayOfGradientPoints.length; i++){
				var arrayOfGradientPointDetails = arrayOfGradientPoints[i].split(" ");
				arrayOfGradientPointDetails.push(new Date().getTime() + i);
				returnArray.push(arrayOfGradientPointDetails);
			}
			return returnArray;
		}
		
		function parseGradientStringHTML5(gradientString){
			var returnArray = new Array();
			var orientation = gradientString.substring(0,15);
			if(orientation == "radial-gradient"){
				//it's a radial gradient
				settings.orientation = "radial";	
			}else{
				//it's a linear gradient
				//get the orientation and the degrees
				var orientation = gradientString.substring(16,gradientString.indexOf(","));
				if(orientation == "90deg"){
					settings.orientation = "horizontal";
					settings.degrees = 90;
				}else if(orientation == "180deg"){
					settings.orientation = "vertical";
					settings.degrees = 180;
				}else{
					settings.orientation = "custom";
					settings.degrees = parseInt(orientation.substring(0, orientation.indexOf("deg")));
				}
			}
			
			//now parse the colors percentages and alphas of the gradient
			var gradientString = gradientString.substring(gradientString.indexOf(",") + 1, gradientString.length - 1);
			var splitArray = gradientString.split("%,");
			
			for(var i =	0; i<splitArray.length; i++){
				//the last item in the array will still have the % on the end
				//we need to remove it
				if(splitArray[i][splitArray[i].length - 1] == "%"){
					splitArray[i] = splitArray[i].substring(0, splitArray[i].length - 1);
				}
				
				//get the color
				var gradientPointArray = new Array();
				var colorString = splitArray[i].substring(splitArray[i].indexOf("rgba"), splitArray[i].indexOf(")") + 1);
				gradientPointArray.push(rgbToHex(colorString))
				
				//get the percentage
				var percent = parseFloat(splitArray[i].substring(splitArray[i].indexOf(" "), splitArray[i].length));
				percent = percent / 100;
				gradientPointArray.push("" + percent);
				
				var alpha = splitArray[i].substring(splitArray[i].lastIndexOf(",") + 1, splitArray[i].indexOf(")"));
				gradientPointArray.push("" + alpha);
				
				gradientPointArray.push(new Date().getTime() + i);
				returnArray.push(gradientPointArray)
			}
			
			return returnArray;
		}
		
		function sortGradientPoints(){
			//sorts the gradient points based on their percentage (lowest to highest)
			var sorter = function(a,b){
				if ((a[1]>b[1])) return 1
				if ((a[1]==b[1])) return 0
				if ((a[1]<b[1])) return -1	
			}
			gradientPoints = gradientPoints.sort(sorter);
		}
		
		function buildGradientCSS(forPreview){
			var returnCSSString;
			
			if(settings.orientation == "radial"){
				if(forPreview){
					return buildGradientCSSLinear(forPreview);	
				}else{
					return buildGradientCSSRadial();	
				}
				
			}else{
				return buildGradientCSSLinear(forPreview);
			}
		}
		
		function buildGradientHTML5(forPreview){
			var returnCSSString;
			
			if(settings.orientation == "radial"){
				if(forPreview){
					return buildGradientHTML5Linear(forPreview);	
				}else{
					return buildGradientHTML5Radial();	
				}
				
			}else{
				return buildGradientHTML5Linear(forPreview);
			}
		}
		
		function buildGradientCSSLinear(forPreview){
			//forpreview is a boolean, if the gradient is being built for preview
			//it will always be horizontal
			
			var out = '';
			var svgX = '0%';
			var svgY = '100%';
			var webkitDir = 'left bottom';
			var defDir = 'top';
			
			if(forPreview){
				defDir = "90deg";	
			}else{
				defDir = settings.degrees + "deg";	
			}
			
            var svg = '<svg xmlns="http://www.w3.org/2000/svg">' + '<defs>' + '<linearGradient id="gradient" x1="0%" y1="0%" x2="' + svgX + '" y2="' + svgY + '">';
            var webkitCss = '-webkit-gradient(linear, left top, ' + webkitDir;
            var defCss = '';
            for(var i = 0; i<gradientPoints.length; i++){
                webkitCss += ', color-stop(' + gradientPoints[i][1] * 100 + '%, ' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ')';
                defCss += ',' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ' ' + gradientPoints[i][1] * 100 + '%';
                svg += '<stop offset="' + gradientPoints[i][1] * 100 + '%" style="stop-color:' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ';" />';
			};
			
            webkitCss += ')';
            defCss = defCss.substr(1);
            svg += '</linearGradient>' + '</defs>' + '<rect fill="url(#gradient)" height="100%" width="100%" />' + '</svg>';
            svg = _base64(svg);
            //out += 'background: url(data:image/svg+xml;base64,' + svg + ');' + '\n';
            out += 'background: ' + webkitCss + ';';
            out += 'background: ' + '-moz-linear-gradient(' + defDir + ',' + defCss + ');';
            out += 'background: ' + '-webkit-linear-gradient(' + defDir + ',' + defCss + ');';
            out += 'background: ' + '-o-linear-gradient(' + defDir + ',' + defCss + ');';
            out += 'background: ' + '-ms-linear-gradient(' + defDir + ',' + defCss + ');';
            out += 'background: ' + 'linear-gradient(' + defDir + ',' + defCss + ');';
			return out;
		}
		
		function buildGradientHTML5Linear(forPreview){
			//forpreview is a boolean, if the gradient is being built for preview
			//it will always be horizontal
			
			var out = '';
			var defDir = 'top';
			
			if(forPreview){
				defDir = "90deg";	
			}else{
				defDir = settings.degrees + "deg";	
			}
			
            var defCss = '';
            for(var i = 0; i<gradientPoints.length; i++){
                defCss += ',' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ' ' + gradientPoints[i][1] * 100 + '%';
			};
			
            defCss = defCss.substr(1);
            out += 'linear-gradient(' + defDir + ',' + defCss + ')';
			return out;	
		}
		
		function buildGradientCSSRadial(){
			
			var out = '';
			var svgX = '0%';
			var svgY = '100%';
			
			/*
			var webkitDir = 'left bottom';
			var defDir = 'top';
			
			if(forPreview){
				defDir = "90deg";	
			}else{
				defDir = settings.degrees + "deg";	
			}*/
			
			var defDir= "nothing";
			
            //var svg = '<svg xmlns="http://www.w3.org/2000/svg">' + '<defs>' + '<linearGradient id="gradient" x1="0%" y1="0%" x2="' + svgX + '" y2="' + svgY + '">';
            var webkitCss = '-webkit-gradient(radial, center center, 0px, center center, 100%';
           
			var defCss = '';
            for(var i = 0; i<gradientPoints.length; i++){
                webkitCss += ', color-stop(' + gradientPoints[i][1] * 100 + '%, ' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ')';
                defCss += ',' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ' ' + gradientPoints[i][1] * 100 + '%';
                //svg += '<stop offset="' + gradientPoints[i][1] * 100 + '%" style="stop-color:' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ';" />';
			};
			
            webkitCss += ')';
            defCss = defCss.substr(1);
            //svg += '</linearGradient>' + '</defs>' + '<rect fill="url(#gradient)" height="100%" width="100%" />' + '</svg>';
            //svg = _base64(svg);
            //out += 'background: url(data:image/svg+xml;base64,' + svg + ');' + '\n';
            out += 'background: ' + webkitCss + ';';
            out += 'background: ' + '-moz-radial-gradient(center, ellipse, cover, ' + defCss + ');';
            out += 'background: ' + '-webkit-radial-gradient(center, ellipse, cover, ' + defCss + ');';
            out += 'background: ' + '-o-radial-gradient(center, ellipse, cover, ' + defCss + ');';
            out += 'background: ' + '-ms-radial-gradient(center, ellipse, cover, ' + defCss + ');';
            out += 'background: ' + 'radial-gradient(ellipse at center,' + defCss + ');';	
			
			return out;	
		}
		
		function buildGradientHTML5Radial(){
			var out = '';
			
			var defCss = '';
            for(var i = 0; i<gradientPoints.length; i++){
                defCss += ',' + hexToRgb(gradientPoints[i][0], parseFloat(gradientPoints[i][2])) + ' ' + gradientPoints[i][1] * 100 + '%';
			};
			
            defCss = defCss.substr(1);
           	out += 'radial-gradient(ellipse at center,' + defCss + ')';	
			
			return out;
		}
		
		function hexToRgb(hex, alpha) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			var resultString = "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + alpha + ")";
			return resultString;
		}
		
		function rgbToHex(rgb){
			rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		 	return (rgb && rgb.length === 4) ? "#" +
		  		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		  		("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		  		("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
		}
		
		function _base64(input) {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                }
                else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }
            return output;
        };
		
		return $holder;
	}
})(jQuery);