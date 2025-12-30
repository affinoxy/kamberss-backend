--
-- PostgreSQL database dump
--

\restrict gX8xGEb3jqIn0haYXGgclGcGRMb7Fmvo86MMtlFvBZ6BRFMG2mMDscGjkXxxxpc

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'CUSTOMER'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    price integer NOT NULL,
    image character varying(255),
    specs text,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stock integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: rental_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_items (
    id integer NOT NULL,
    rental_id integer,
    product_id integer,
    price integer
);


ALTER TABLE public.rental_items OWNER TO postgres;

--
-- Name: rental_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rental_items_id_seq OWNER TO postgres;

--
-- Name: rental_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_items_id_seq OWNED BY public.rental_items.id;


--
-- Name: rentals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rentals (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100),
    phone character varying(20),
    start_date date,
    end_date date,
    total integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    return_date timestamp without time zone,
    return_notes text
);


ALTER TABLE public.rentals OWNER TO postgres;

--
-- Name: rentals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rentals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rentals_id_seq OWNER TO postgres;

--
-- Name: rentals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rentals_id_seq OWNED BY public.rentals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: rental_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items ALTER COLUMN id SET DEFAULT nextval('public.rental_items_id_seq'::regclass);


--
-- Name: rentals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals ALTER COLUMN id SET DEFAULT nextval('public.rentals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, category, name, price, image, specs, description, created_at, stock) FROM stdin;
13	camera	CANON 760D	80000	/images/cameras/canon760d.jpg			2025-12-15 22:46:31.269067	5
14	camera	CANON 200D	85000	/images/cameras/canon200d.jpg			2025-12-15 22:46:31.269067	5
15	camera	CANON 800D	90000	/images/cameras/canon800d.jpg			2025-12-15 22:46:31.269067	5
16	camera	CANON 80D	80000	/images/cameras/canon80d.jpg			2025-12-15 22:46:31.269067	5
17	camera	CANON 6D	120000	/images/cameras/canon6d.jpg			2025-12-15 22:46:31.269067	5
18	camera	CANON M10	60000	/images/cameras/canonm10.jpg			2025-12-15 22:46:31.269067	5
19	camera	CANON M100	70000	/images/cameras/canonm100.jpg			2025-12-15 22:46:31.269067	5
20	camera	CANON M3	80000	/images/cameras/canonm3.jpg			2025-12-15 22:46:31.269067	5
21	camera	CANON M50	120000	/images/cameras/canonm50.jpg			2025-12-15 22:46:31.269067	5
22	camera	SONY A6000	100000	/images/cameras/sonya6000.jpg			2025-12-15 22:46:31.269067	5
23	camera	SONY A6300	140000	/images/cameras/sonya6300.jpg			2025-12-15 22:46:31.269067	5
24	camera	SONY A6400	160000	/images/cameras/sonya6400.jpg			2025-12-15 22:46:31.269067	5
25	camera	SONY ZV-E10	160000	/images/cameras/sonyzve10.jpg			2025-12-15 22:46:31.269067	5
38	lenses	Canon Kit 18-55mm	20000	/images/lenses/canonkit18-55mm.jpg	\N		2025-12-16 21:53:37.303333	3
39	lenses	Canon 50mm f1.8	40000	/images/lenses/canon50mmf1.8.jpg	\N		2025-12-16 21:53:37.303333	3
41	lenses	Canon 75-300mm	350000	/images/lenses/canon75-300mm.jpg	\N		2025-12-16 21:53:37.303333	3
42	lenses	Canon Kit 15-45mm	20000	/images/lenses/canonkit15-45mm.jpg	\N		2025-12-16 21:53:37.303333	3
43	lenses	Canon RF 50mm f1.8	20000	/images/lenses/canonrf50mmf1.8.jpg	\N		2025-12-16 21:53:37.303333	3
44	lenses	Sony Kit 16-50mm	20000	/images/lenses/sonykite16-50mm.jpg	\N		2025-12-16 21:53:37.303333	3
45	lenses	Sony E 35mm f1.8	65000	/images/lenses/sonye35mmf1.8.jpg	\N		2025-12-16 21:53:37.303333	3
46	lenses	Sony E 50mm f1.8	60000	/images/lenses/sonye50mmf1.8.jpg	\N		2025-12-16 21:53:37.303333	3
47	lenses	Sony E 18-105mm f4	100000	/images/lenses/sonye18-105f4.jpg	\N		2025-12-16 21:53:37.303333	3
48	lenses	Fujifilm Kit XC 15-45mm	30000	/images/lenses/fujikitxc15-45mm.jpg	\N		2025-12-16 21:53:37.303333	3
49	lenses	Fujifilm Kit XC 16-50mm	20000	/images/lenses/fujikitxc16-50mm.jpg	\N		2025-12-16 21:53:37.303333	3
50	lenses	Fujinon XF 16-55mm f2.8	120000	/images/lenses/fujinonxf16-55mmf2.8.jpg	\N		2025-12-16 21:53:37.303333	3
40	lenses	Canon 70-200mm f2.8	120000	/images/lenses/canon700-200mmf2.8.jpg	\N		2025-12-16 21:53:37.303333	3
26	camera	SONY A7 II	190000	/images/cameras/sonya7ii.jpg			2025-12-15 22:46:31.269067	5
27	camera	SONY A7 III	290000	/images/cameras/sonya7iii.jpg			2025-12-15 22:46:31.269067	5
28	camera	SONY A7C	290000	/images/cameras/sonya7c.jpg			2025-12-15 22:46:31.269067	5
29	camera	SONY A7C II	325000	/images/cameras/sonya7cii.jpg			2025-12-15 22:46:31.269067	5
30	camera	SONY A7 IV	350000	/images/cameras/sonya7iv.jpg			2025-12-15 22:46:31.269067	5
31	camera	FUJIFILM X-A10	60000	/images/cameras/fujifilmxa10.jpg			2025-12-15 22:46:31.269067	5
32	camera	FUJIFILM X-A3	80000	/images/cameras/fujifilmxa3.jpg			2025-12-15 22:46:31.269067	5
33	camera	FUJIFILM X-T100	100000	/images/cameras/fujifilmxt100.jpg			2025-12-15 22:46:31.269067	5
34	camera	FUJIFILM X-T200	120000	/images/cameras/fujifilmxt200.jpg			2025-12-15 22:46:31.269067	5
35	camera	FUJIFILM X-T20	140000	/images/cameras/fujifilmxt20.jpg			2025-12-15 22:46:31.269067	5
36	camera	FUJIFILM X-H1	190000	/images/cameras/fujifilmxh1.jpg			2025-12-15 22:46:31.269067	5
37	camera	FUJIFILM X-T3	200000	/images/cameras/fujifilmxt3.jpg			2025-12-15 22:46:31.269067	5
10	camera	CANON 1300D	55000	/images/cameras/canon1300d.jpg			2025-12-15 22:46:31.269067	5
11	camera	CANON 600D	60000	/images/cameras/canon600d.jpg			2025-12-15 22:46:31.269067	5
12	camera	CANON 700D	70000	/images/cameras/canon700d.jpg			2025-12-15 22:46:31.269067	5
67	gimbal	Zhiyun Crane Plus	150000	/images/gimbal/zhiyuncraneplus.jpg	\N	Kamera	2025-12-17 20:58:23.218575	4
68	gimbal	DJI Osmo RS 4 Mini	170000	/images/gimbal/djiosmors4mini.jpg	\N	Kamera	2025-12-17 20:58:23.218575	4
69	gimbal	Dji Osmo Mobile 6	70000	/images/gimbal/djiosmomobile6.jpg	\N	HP	2025-12-17 20:58:23.218575	4
57	actioncam	Insta 360 X3	160000	/images/package/paketweddingsuperior.jpg	\N		2025-12-17 14:47:07.886093	4
58	actioncam	Insta 360 X4	190000	/images/package/paketweddingdeluxe.jpg	\N		2025-12-17 14:47:07.886093	4
52	actioncam	DJI Osmo Pocket 1	120000	/images/actioncam/djiosmopocket1.jpg	\N		2025-12-17 14:47:07.886093	4
53	actioncam	DJI Osmo Pocket 3	190000	/images/actioncam/djiosmopocket3.jpg	\N		2025-12-17 14:47:07.886093	4
54	actioncam	GoPro Hero 8	120000	/images/actioncam/goprohero8.jpg	\N		2025-12-17 14:47:07.886093	4
55	actioncam	GoPro Hero 12	175000	/images/actioncam/goprohero12.jpg	\N		2025-12-17 14:47:07.886093	4
56	actioncam	GoPro Max 360	150000	/images/actioncam/gopromax360.jpg	\N		2025-12-17 14:47:07.886093	4
59	actioncam	Insta 360 GO 3S	190000	/images/actioncam/insta360go3s.jpg	\N		2025-12-17 14:47:07.886093	4
51	lenses	Fujinon XF 23mm f2	65000	/images/lenses/fujinonxf23mmf2.jpg	\N		2025-12-16 21:53:37.303333	3
61	packages	Paket Vlogging 2	108000	/images/package/paketvlogging12.jpg	\N	Canon M3, Canon Kit, Mic Boya MMI, L Bracket	2025-12-17 20:22:35.980009	2
70	lighting	Godox SK400 II	80000	/images/lighting/GodoxSK400II.jpg	\N	Termasuk Stand	2025-12-17 21:20:58.45644	0
71	lighting	Godox TT600	40000	/images/lighting/GodoxTT600.jpg	\N	Universal	2025-12-17 21:20:58.45644	0
72	lighting	Trigger X1T	150000	/images/lighting/TriggerX1T.jpg	\N	Sony, Fujifilm, Canon	2025-12-17 21:20:58.45644	0
62	packages	Paket Vlogging Mobile	82000	/images/package/paketvloggingmobile.jpg	\N	DJI Osmo Mobile 6, Mic Boya MMI, L Bracket	2025-12-17 20:22:35.980009	2
63	packages	Paket Live Streaming	175000	/images/package/paketlivestreaming.jpg	\N	Sony Cx405, Ezcap HDMI Capture, Saramonic Blink B2 500, Tripod Standar	2025-12-17 20:22:35.980009	2
64	packages	Paket Wedding Lite	215000	/images/package/paketweddinglite.jpg	\N	Canon 60D, Kit Canon STM, Canon 50mm STM, Godox TT600 (2 Unit), Lightstand (2 Unit), Godox X1T, Payung (2 Unit) 	2025-12-17 20:22:35.980009	2
60	packages	Paket Vlogging 1	126000	/images/package/paketvlogging12.jpg	\N	Fujifilm X-T100, Fuji Kit, Mic Boya MMI, L Bracket	2025-12-17 20:22:35.980009	2
65	packages	Paket Wedding Superior	222000	/images/package/paketweddingsuperior.jpg	\N	Canon 60D, Kit Canon STM, Canon 50mm STM, Godox TT600 (2 Unit), Lightstand (2 Unit), Godox K-180 (1 Set), Payung (2 Unit)	2025-12-17 20:22:35.980009	2
66	packages	Paket Wedding Deluxe	454000	/images/package/paketweddingdeluxe.jpg	\N	Sony A7 II, Sigma ART fe 24-79mm, Godox SK400II (2 Unit) , Godox X2T Sony, Lightstand (2 Unit), Godox X1T, Payung (2 Unit)	2025-12-17 20:22:35.980009	2
\.


--
-- Data for Name: rental_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_items (id, rental_id, product_id, price) FROM stdin;
6	2	23	140000
7	2	39	40000
8	2	54	120000
9	3	11	60000
10	4	11	60000
11	5	11	60000
12	6	11	60000
\.


--
-- Data for Name: rentals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rentals (id, name, email, phone, start_date, end_date, total, status, created_at, return_date, return_notes) FROM stdin;
1	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-01	2026-01-02	\N	menunggu	2025-12-15 12:54:26.415873	\N	\N
2	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-02	2026-01-04	\N	disetujui	2025-12-28 17:54:36.566263	\N	\N
3	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-02	2026-01-04	\N	pending	2025-12-28 19:59:46.572704	\N	\N
4	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-02	2026-01-04	\N	pending	2025-12-28 20:02:04.261219	\N	\N
5	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-02	2026-01-04	\N	pending	2025-12-28 20:02:04.460312	\N	\N
6	Muhammad Ichsan	ichsanhimawan@gmail.com	085897598555	2026-01-02	2026-01-04	\N	dikembalikan	2025-12-28 20:06:33.248611	2025-12-28 21:13:01.83324	
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_at, updated_at) FROM stdin;
1	Admin 1	admin1@test.com	admin123	ADMIN	2025-12-15 21:30:49.759476	2025-12-15 21:30:49.759476
2	User 1	user2@test.com	user123	CUSTOMER	2025-12-15 21:30:49.759476	2025-12-15 21:30:49.759476
\.


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 72, true);


--
-- Name: rental_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rental_items_id_seq', 12, true);


--
-- Name: rentals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rentals_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: rental_items rental_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT rental_items_pkey PRIMARY KEY (id);


--
-- Name: rentals rentals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: rental_items rental_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT rental_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: rental_items rental_items_rental_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT rental_items_rental_id_fkey FOREIGN KEY (rental_id) REFERENCES public.rentals(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gX8xGEb3jqIn0haYXGgclGcGRMb7Fmvo86MMtlFvBZ6BRFMG2mMDscGjkXxxxpc

