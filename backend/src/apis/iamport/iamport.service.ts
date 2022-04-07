import {
  ConflictException,
  HttpException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IamportService {
  async getIamportToken() {
    // 1. 아임포트에 요청해서 결제완료기록이 있는지 확인하기
    try {
      const getToken = await axios.post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.IAMPORT_API_KEY, // REST API키
          imp_secret: process.env.IAMPORT_SECRET,
        },
      );
      const { access_token } = getToken.data.response;

      return access_token;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.data.status,
      );
    }
  }
  async checkPaid({ impUid, myamount, token }) {
    try {
      const getPaymentData = await axios.get(
        `https://api.iamport.kr/payments/${impUid}`,
        {
          headers: { Authorization: token },
        },
      );
      const paymentData = getPaymentData.data.response; // 조회한 결제 정보
      const { status, amount } = paymentData;
      if (status !== 'paid') {
        throw new ConflictException('결제내역이 존재하지 않습니다.');
      }
      if (amount !== myamount) {
        throw new UnprocessableEntityException('결제금액이 잘못되었습니다.');
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        throw new HttpException(
          error.response.data.message,
          error.response.data.status,
        );
      } else {
        throw error;
      }
    }
  }
  async getCancel({ impUid, token }) {
    try {
      const result = await axios.post(
        'https://api.iamport.kr/payments/cancel',
        {
          imp_uid: impUid, // imp_uid를 환불 `unique key`로 입력
          // amount: cancel_request_amount, // 가맹점 클라이언트로부터 받은 환불금액
        },
        {
          headers: {
            Authorization: token, // 아임포트 서버로부터 발급받은 엑세스 토큰},
          },
        },
      );

      return result.data.response.cancel_amount;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.data.status,
      );
    }
  }
}
