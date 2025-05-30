// ignore_for_file: avoid_print

class FormBuilder {
  final String docType = "<!DOCTYPE html>";

  final String htmlStart = "<html>";
  final String htmlEnd = "</html>";
  final String head = """
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pine Labs | Edge | Checkout</title>

    <style>
   .lds-roller {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
 
  position: absolute;
  top: 50%;
  left: 50%;
}
.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 40px 40px;
}
.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #000;
  margin: -4px 0 0 -4px;
}
.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: 63px;
  left: 63px;
}
.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: 68px;
  left: 56px;
}
.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: 71px;
  left: 48px;
}
.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: 72px;
  left: 40px;
}
.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: 71px;
  left: 32px;
}
.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: 68px;
  left: 24px;
}
.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: 63px;
  left: 17px;
}
.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: 56px;
  left: 12px;
}
@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
  </style>
  </head>

  """;

  final String bodyStart =
      "<body><div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>";

  final String bodyEnd = "</body>";

  final String formStart =
      "<form id='PostForm' name='PostForm' action='{{url}}' method='POST'>";
  final String formEnd = "</form>";

  final String script = """

    <script language="javascript">
        var vPostForm = document.PostForm;
        vPostForm.submit();
    </script>

  """;

  final String input =
      "<input type='hidden' name='{{name}}' value='{{value}}'>";

  createInput(String key, String value) {
    return input.replaceAll("{{name}}", key).replaceAll("{{value}}", value);
  }

  createForm(String url, String inputs) {
    return formStart.replaceAll("{{url}}", url) + inputs + formEnd;
  }

  createHtml(String form) {
    return docType +
        htmlStart +
        head +
        bodyStart +
        form +
        bodyEnd +
        script +
        htmlEnd;
  }

  gern(String url, Map<String, String> inputs) {
    var formInputsFields = "";
    var form = "";

    inputs.forEach((k, v) => formInputsFields += createInput(k, v));

    form = createForm(url, formInputsFields);
    print(form);

    return createHtml(form);
  }
}
