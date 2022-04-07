export const getTemplate = ({ authNumber }) => {
  return `
      <html>
        <body>
          <h1 style="color: red">귀하의 의 요청 인증번호는 다음과 같습니다!!!</h1>
          <hr />
          <div>확인번호: ${authNumber}</div>
        </body>
      </html>
    `;
};
