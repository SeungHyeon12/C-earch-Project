﻿# C'earch Project (담당part 설명 by PM 및 main 개발자 승현수)
-------------------
![image](https://user-images.githubusercontent.com/72781752/162286009-2952f820-23a4-4b16-b98c-fe06060a1d89.png)
### project 기간 : 3/14 ~ 4/4

## 사용기술 stack
![image](https://user-images.githubusercontent.com/72781752/162289487-089bde27-9c7d-4493-a886-fe861c525017.png)


## project의 방향성
+ 코딩을 하면서 모르는 부분을 구글링 하면 ‘StackOverFlow’와 같은 기존 코드 커뮤니티
사이트의 경우 언어적이나 스택적인 부분에서 이해하기 다소 어려운 부분이 있고,
실시간으로 질문과 답변을 볼 수 없어 이 프로젝트를 기획하게 되었습니다 멘토 멘티의 구조로 이루어져 있으며 멘토는 클래스를 개설하고 수강생들에게 채팅을 통하여 zoom 주소를 알려주거나
하는 방식으로 진행되며, 나의 관심사 혹은 검색을 통해서 원하는 카테고리의 클래스 멘토를 선택하고 팔로우 할 수 있습니다

## 페이지 구성 및 개요
![image](https://user-images.githubusercontent.com/72781752/162289664-210fcbc2-81a7-42ea-b39c-34d6ab501e8c.png)
+ 위와같이 서비스흐름도가 구성되어있습니다. 차후적으로 설명드릴 내용은 아래와 같습니다
>+ 서비스 페이지에 따른 erd 및 api 명세서 작성
>+ 멘토 멘티 관리자 role 에 따른 권한분기 설정에 따른 api 개발
>+ 서버에서의 부하 줄이기
>+ 대규모 트래픽을 고려한 분산형 아키텍트 구성 및 배포

## ERD 및 api 명세서 

### ERD
![image](https://user-images.githubusercontent.com/72781752/162298043-67576bf8-7258-4fca-889e-fa858f15c7bd.png)

![image](https://user-images.githubusercontent.com/72781752/162299243-b1647731-7027-4eba-b4c0-2098d61f949d.png)

+ 우선적으로 멘토 멘티에대한 정보가 중복 요소들이 많기 때문에 멘토 멘티에대한 테이블을 따로파서 진행하기 보다는 승격을 하여서 멘토id를 부여하는 방식으로 진행하기로 하였습니다
+ 프론트에서 필수적으로 나와야할 요소들에 대해서 join 횟수를 줄여 속도를 검색 속도를 올리기위해서 중복컬럼을 사용하였습니다.

### API 명세서
![image](https://user-images.githubusercontent.com/72781752/162307997-0f935b72-3bed-49da-b2b7-3eede455e2fd.png)

+ FRONTEND 측에서의 MOCKUP에 따라서 페이지에 따른 데이터들을 정리하였습니다.
+ 정리된 데이터를 기반으로 함수NAME 및 들어갈 argument name 및 api의 권한분기를 진행하여 진행하였습니다.
+ 사용될 api에 영향을 끼칠 table을 작성하여 개발시 서로 entity에 영향을 줄 수 있는 부분을 배제하였습니다.

## api 개발 및 권한
### USER create
 NHN CLOUD SERVICE 를 사용하여서 가입시 비밀번호를 사용하여서 인증 후 bcrypt 를 이용하여 hash 값을 db 에 저장하도록 하였습니다.
 ```
  async sendTokenPhone({ phoneNumber, authNumber }: ItokenPhone) {
    const appKey = process.env.SMS_APP_KEY;
    const XSecretKey = process.env.SMS_X_SECRET_KEY;
    const sender = process.env.SMS_SENDER;
    try {
      const result = await axios.post(
        `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${appKey}/sender/sms`,
        {
          body: `안녕하세요. 인증번호는 ${authNumber}입니다.`,
          sendNo: sender,
          recipientList: [
            {
              internationalRecipientNo: phoneNumber,
            },
          ],
        },
        {
          headers: {
            'X-Secret-Key': XSecretKey,
            'Content-Type': 'application/json;charset=UTF-8',
          },
        },
      );
      return '정상적으로 보내졌습니다';
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'cannot send mesage to Phone',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
 ```
 ![image](https://user-images.githubusercontent.com/72781752/162316121-bb4e81d3-a752-4a2e-bb1e-fadf3b060e10.png)


