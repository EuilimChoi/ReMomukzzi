import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageCarousel from "../components/ImageCarousel";
import ShopInfo from "../components/ShopInfo";
import KaKaoMap from "../components/KaKaoMap";

import { useEffect } from "react";
import axios from "axios";
import { Image, Row, Col } from "antd";
import { loadingAction, getShopInfo, firstGetAction } from "../reducers";
import { useDispatch, useSelector } from "react-redux";
import IntroImageSet from "../components/IntroImageSet";
import MoreviewLoader from "../components/MoreviewLoader";

const Home = () => {
	const dispatch = useDispatch();
	const isLoading = useSelector(state => state.isLoading);
	const shopInfo = useSelector(state => state.shopInfo);
	const isFirstGet = useSelector(state => state.isFirstGet);

	useEffect(() => {
		function getLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						let temp = [];
						for (let i = 1; i < 4; i++) {
							axios
								.get(
									`https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&page=${i}&size=15&sort=accuracy&x=${position.coords.longitude}&y=${position.coords.latitude}&radius=2000`,
									{
										headers: {
											Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_KEY,
										},
									}
								)
								.then(res => {
									temp = [...temp, ...res.data.documents];
									return temp;
								})
								.then(res => {
									if (res.length === 45) {
										axios
											.post(
												`${process.env.NEXT_PUBLIC_SERVER_URL}/data`,
												{ data: res },
												{
													withCredentials: true,
												}
											)
											.then(res => {
												console.log(res.data.data.result);
												dispatch(getShopInfo(res.data.data.result));

												dispatch(loadingAction());
												dispatch(firstGetAction());
											});
									}
								});
						}
					},
					function (error) {
						console.error(error);
					},
					{
						enableHighAccuracy: false,
						maximumAge: 0,
						timeout: Infinity,
					}
				);
			} else {
				alert("GPS를 지원하지 않습니다");
			}
		}
		if (!isFirstGet) {
			getLocation();
		} else {
			console.log("다시 불러오지 않음");
		}
	}, []);

	return (
		<>
			{!isLoading ? (
				<>
					<Header />
					<Row>
						<Col cs={24} md={12}>
							<ImageCarousel imageInfo={shopInfo} />
							<Row>
								<Col cs={24} md={12}>
									<ShopInfo shopInfo={shopInfo} />
								</Col>
								<Col cs={24} md={12}>
									<KaKaoMap Info={shopInfo} />
								</Col>
							</Row>
						</Col>
						<Col cs={24} md={12}>
							<IntroImageSet imageInfo={shopInfo} />
						</Col>
					</Row>
					<Footer />
				</>
			) : (
				<MoreviewLoader />
			)}
		</>
	);
};

export default Home;
