setTimeout(() => {
  var child: any = []
  if ($(".wrap").length) {
    if ($(".wrap").length > 2) {
      $(".wrap").each(function () {
        var $wrap = $(this);
        $wrap.find("ul li a").each(function () {
          child.push({
            "img":$(this).find('img').prop('src'),
            "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
            "twinCatInfo": $wrap.find("h3").text().trim() + "###" + $(this).text().trim(),
          });
        });
      });
    } else {
      $(".wrap ul li a").each(function () {
        child.push({
          "img":$(this).find('img').prop('src'),
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text().trim(),
        })
      });
    }

  } else if ($(".send_sp").length) {
    if ($(".send_sp li").length) {
      $(".send_sp li a").each(function () {
        child.push({
          "img":$(this).find('img').prop('src'),
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text().trim()
        })
      });
    } else {
      $(".send_sp").next().find("li a").each(function () {
        child.push({
          "img":$(this).find('img').prop('src'),
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text().trim()
        })
      });
    }
  }
  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}, 3000);
