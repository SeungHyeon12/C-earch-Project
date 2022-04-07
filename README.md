# C'earch Project (담당part 설명 by PM 및 main 개발자 승현수)

![image](https://user-images.githubusercontent.com/72781752/162286009-2952f820-23a4-4b16-b98c-fe06060a1d89.png)
### project 기간 : 3/17 ~ 4/4

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
>+ socket을 통한 실시간 서비스
>+ fileupload에서 서버에서의 부하 줄이기
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
 NHN CLOUD SERVICE 를 사용하여서 랜덤으로 생성된 인증번호를 인증 후 bcrypt 를 이용하여 password의 hash 값을 db 에 저장하도록 하였습니다.
 또한 user form에 따른 값들을 저장하도록 하였습니다.
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
 ### USER fetch 
 서비스의 특징상 내가 듣기원하는 카테고리(ex. Java , python) 과같이 선택항목에 대한 filtering 하여 결과를 보여줘여하는 경우가 많이 있습니다.
 이에따라서 각각의 sorting 에 따른 fetch 하는 api 들을 구현하였습니다.
 또한 위에서 말했듯이 서비스에서 멘티에서 멘토로의 승격시스템을 통해 중복 데이터를 줄인다고 하였습니다. 즉 멘티(가입된상태) 에서 클래스의 가입 form 을 작성하고 
 mentor table에서 pending 인상태가 됩니다. 이 후 관리자의 승인에 따라 authroize 상태로 바뀌면 그 때부터 fetch 해올 수 있게 구성하였습니다.
 
 
 ![image](https://user-images.githubusercontent.com/72781752/162324927-5f8c600c-d430-4efc-9901-5d085f5de6b8.png)
 
 ### USER LOGIN
로그인을 하였을 때 데이터베이스의 hashed password와 bcrypt와의 match 가 이루어지면 accesstoken과 refresh token이 발급되도록 
JWT를 이용하여 구성하였습니다.

>![image](https://user-images.githubusercontent.com/72781752/162326264-91033a2b-c455-42af-9942-1c9127d83cd5.png)

 ### USER LOGOUT
 로그아웃을 하였을 때 저장된 쿠키의 refresh token의 값을 RediS에 BLACKLIST로 등록하여 같은 정보를 담고 있을 시 이를 Validate 에서 검증하도록 진행하였습니다
 ```
 async enrollBlackList({ user, refreshToken }) {
    try {
      console.log('useeerrr exp : ', user.exp);
      const result = await this.cacheManager.set(
        `refresh:${refreshToken}`,
        `Token:${user.id}`,
        {
          ttl: user.exp - Math.ceil(Number(Date.now()) / 1000),
        },
      );

      return result;
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException('Redis error occured');
    }
  }
  ```
  ### Strategy 및 권한
  로그인하였을 때 accesstoken의 주기를 짧게주고 refreshtoken을 통해 다시 재발급받는 형식으로 진행되었습니다. 따라서 accessToken의 strategy 와 refreshToken에 대한 strategy
  를 사용하여서 guard를 통해 권한을 분기해주었습니다. 
  
  
  ![image](https://user-images.githubusercontent.com/72781752/162328516-d7181bd6-b2c4-4927-a395-dac492adc66b.png)
  
  
  위와같이 guard를 통과하지 못하는 경우 에러가 나오게 됩니다.
  또한 위에서 말했듯이 Admin , Mentee , Mento 에대한 role 을 분리하여 api 를 관리하였기 때문에 이에따른 roleGuard를 통해서 api의 접근권한을 제한합니다.
 ```
 //role에대한 decorator 생성및 roleguard 적용
  @Mutation(() => Boolean)
  @UseGuards(GqlAccessGuard,RoleGuaard)
  @Role(USER_ROLE.ADMIN)
  async deleteUser(
    @CurrentUser() currentUser: IcurrentUser,
    @Args('userId') userId: string,
  ) {
    return await this.userService.delete({
      currentUser,
      userId,
    });
  }
  ```
  ## SOCKET을 통한 실시간 서비스 
  멘토와 멘티가 대화를 진행할 수 있는 서비스입니다. 서비스에서 소켓을 써야하는 두가지 서비스는 다음과 같습니다
  1. 실시간 채팅서비스
  2. LOGIN 상태인지 확인하기
  
  ### 실시간 채팅서비스 
  실시간채팅서비스의 로직은 다음과 같이 구성하였습니다. 
  1. 유저가 로그인을 할경우 발급되는 COOKIE를 이용하여 CONNECT시 자동으로 생성되는 방 외에 USER ID(uuid)의 방을 들어가게 해야한다
  2. 유저가 chat 페이지를 들어가면 graphql 에서 프론트에 랜더링할 방의 자료및 내가 속해있는 방을 뿌려주는 과정 
  3. 유저가 방을 접속할 때 방에 대한 유저의 정보를 저장하고 room에 반영한다
  4. 유저가 방을 나갔다 오더라도 socket room 에서 나가는것이 아닌 채팅로그가 저장되어 불러 올 수 있어야한다
  5. 메세지를 보낼 경우 해당 방에만 보낼 수 있도록
  
  위의 5 가지의 경우를 생각하여서 구성하였습니다 
  즉 유저가 나가거나해도 방이 없어지지 않도록 또 채팅로그를 랜더링할 수 있도록 로그를 저장 할 수 있도록 db를 사용하였습니다
  
  ###  db에 대한 고찰
  위의 문제를 해결하기위한 방법으로 기존의 mysql을 사용할지 아니면 다른 db 를 사용할지 고민했었습니다 
  다만 채팅은 실시간서비스이기 때문에 채팅로그를 비롯하여서 유저들에게 빠르게 전달해야하는 점을 고려하여 rdbs인 mysql 보다 nosql로 속도면에서 이득이 있는 mongo db를
  사용하게 되었습니다. 
  
  
  ![image](https://user-images.githubusercontent.com/72781752/162332329-7eae5ea7-4f8a-41f7-924c-30cc84f0b55c.png)
  
  
  따라서 채팅로그를 저장해놓고 방을 접속하는 순간 로그를 mongodb에서 검색조건에 따라 (채팅방을 접속한 날짜기준으로부터 주는형식) 제공해줍니다.
  
  
  ![image](https://user-images.githubusercontent.com/72781752/162332678-db58c754-b894-4767-aacd-e7a58230e3c4.png)
  
  또한 websocket에대한 guard를 통해서 header의 handshake안의 토큰값이 만료되면 chat log를 보낼 수 없도록 설정해놓았습니다
  
  
  ## fileupload 의 서버부하 줄이기
  기존에 사용된 방식은 front에서 file을 서버로 보내면 file interceptor를 통해서 파일을 받고 s3 와의 stream을 연결하하는 방식입니다. 
   이를 개선하기 위해서 스토리지에 저장된 이미지를 불러오거나
  (get) 혹은 저장하는 방식(get)을 서버리스(serverless) 한방식으로 진행하였습니다
  
  ![image](https://user-images.githubusercontent.com/72781752/162334104-999c9836-e16f-49db-9091-ec131d014e95.png)
  
  즉 위와같이 스토리지에 저장되는 이미지 파일들을 불러오는 과정을 클라이언트에서 서버로 요청을하여서 presigned URL 을 발급하여 클라이언트에서 직접적으로 
  s3 에 올리는 방식으로 진행하였습니다
  
![image](https://user-images.githubusercontent.com/72781752/162334403-42469b0b-fb27-4089-8586-94c380c137fe.png)

## 대규모 트래픽을 고려한 분산형 아키텍트 구성 및 배포
  기본적인 인스턴스를 올리는 방식보다는 서비스가 실제로 배포된 경우 대규모 트래픽을 받을 때를 상정하여 아키텍트를 구성하였습니다. 
  이에대해 두가지로 나누어 말씀드리겠습니다. 아래는 저희 서비스가 실제로 배포된 아키텍트입니다
  
  ![image](https://user-images.githubusercontent.com/72781752/162335160-effbeb95-abaf-4f5d-aefb-64eb68a8cd20.png)

  
  1. kubernetes를 사용한 오토스케일링 및 배포
  2. 채팅서버에대한 분산(redis cluster)

### kubernetes를 사용한 오토스케일링 및 배포 
  backend server와 front server에 대한 deployment를 분리하여 k8s 클러스터 내에서 오토스케일링이 될 수 있도록 구성하였습니다.
  k8s 를 사용하기 위해서 AWS 의 EKS 를 사용하였고 service deploy ingress에대한 yaml 파일을 작성하여 배포하였습니다 (kubernetes folder 참조)
  
  ![image](https://user-images.githubusercontent.com/72781752/162336560-afabbdb4-8626-41d8-a670-c24a2e0ce3e0.png)
  (k8s node 및 vpc 연결)
  
  
  

  




  
  
  
  
  


 


