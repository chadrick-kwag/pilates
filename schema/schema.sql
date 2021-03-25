--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: activity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.activity_type AS ENUM (
    'PILATES',
    'GYROTONIC',
    'BALLET',
    'GYROKINESIS'
);


ALTER TYPE public.activity_type OWNER TO postgres;

--
-- Name: gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.gender OWNER TO postgres;

--
-- Name: grouping_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.grouping_type AS ENUM (
    'INDIVIDUAL',
    'SEMI',
    'GROUP'
);


ALTER TYPE public.grouping_type OWNER TO postgres;

--
-- Name: lesson_cancel_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lesson_cancel_type AS ENUM (
    'ADMIN',
    'INSTRUCTOR_REQUEST',
    'CRITICAL_CLIENT_REQUEST'
);


ALTER TYPE public.lesson_cancel_type OWNER TO postgres;

--
-- Name: ticket_assign_cancel_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_assign_cancel_type AS ENUM (
    'ADMIN',
    'CLIENT_REQUEST',
    'LESSON_CANCEL'
);


ALTER TYPE public.ticket_assign_cancel_type OWNER TO postgres;

--
-- Name: add_tickets(integer, integer, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_tickets(plan_id integer, add_size integer, expire_datetime timestamp with time zone) RETURNS record
    LANGUAGE plpgsql
    AS $$
declare

temp_int int;
temp_bool bool;
temp_float float;
exist_totalcost int;
exist_rounds int;

begin

-- check plan id exists

select count(1) into temp_int from plan where plan.id = plan_id;

if temp_int != 1 then
return (false, 'invalid plan'::text);
end if;


-- check add size

select add_size > 0 into temp_bool;

if temp_bool = false then
return (false, 'invalid add size'::text); 
end if;


-- get per ticket cost of plan
temp_float := null;
select totalcost/rounds into temp_float from plan where plan.id = plan_id;

if temp_float is null then
return (false, 'invalid ticket cost'::text);
end if;

raise notice 'temp_float %', temp_float;

-- create more tickets
temp_int:=null;
with A as (insert into ticket (expire_time, creator_plan_id) select expire_datetime, plan_id from generate_series(1, add_size) returning id)
select count(1) into temp_int from A;

if temp_int is null then
return (false, 'insert error'::text);
end if;



-- update plan info
temp_int:= null;
update plan set rounds=A.rounds, totalcost = A.totalcost from (select rounds+add_size as rounds, totalcost + (add_size * temp_float) as totalcost from plan where plan.id = plan_id) as A
where plan.id = plan_id returning plan.id into temp_int;


raise notice 'temp_int %',temp_int;

if temp_int is null then
return (false, 'update plan failed'::text);
end if;

return (true, null::text);




end;
$$;


ALTER FUNCTION public.add_tickets(plan_id integer, add_size integer, expire_datetime timestamp with time zone) OWNER TO postgres;

--
-- Name: cancel_individual_lesson(integer, integer, character varying, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cancel_individual_lesson(_lessonid integer, _clientid integer, _reqtype character varying, _force_penalty boolean) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
lesson_valid_check bool :=false;
client_valid_check bool := false;
assign_id_arr int[] :=null;
assign_count int :=null;
assign_id int :=null;
assign_lesson_starttime timestamp with time zone :=null;
assign_delete_or_update_done bool :=false;
assign_lesson_id int :=null;
assign_grouping_type grouping_type := null;

BEGIN

-- check for reqtype
if lower(_reqtype)='admin' or lower(_reqtype)='client_req' then
else 
return (false, false, 'invalid reqtype'::text);
end if;

-- valid check lesson

SELECT count(1)> 0 into lesson_valid_check from lesson where lesson.id = _lessonid;

if lesson_valid_check=false then
return (false, false,'lesson valid check fail'::text);
end if;


SELECT count(1)>0 into client_valid_check from client where client.id = _clientid;

if client_valid_check = false then
return (false, false,'client valid check fail'::text);
end if;

-- find valid assign connecting lesson and client which is individual grouping

select count(1) , (array_agg(assign_ticket.id))[1],
(array_agg(lesson.starttime))[1] ,
(array_agg(lesson.id))[1],
(array_agg(plan.grouping_type))[1]
into assign_count, assign_id, assign_lesson_starttime, assign_lesson_id, assign_grouping_type
from assign_ticket
left join ticket on assign_ticket.ticketid = ticket.id
left join plan on ticket.creator_plan_id = plan.id
left join lesson on assign_ticket.lessonid = lesson.id
where assign_ticket.lessonid = _lessonid
AND plan.clientid = _clientid
ANd assign_ticket.canceled_time is null
AND plan.grouping_type = 'INDIVIDUAL';


raise notice 'assign_id: %', assign_id;
raise notice 'assign_lesson_starttime: %', assign_lesson_starttime;
raise notice 'assign_grouping_type: %', assign_grouping_type;

assert assign_count =1 , 'assign count not 1';
assert assign_id is not null , 'assign_id is null';
assert assign_lesson_starttime is not null, 'assign_lesson_starttime is null';
assert assign_lesson_id is not null ,'assign_lesson_id is null';


raise notice 'assign lesson starttime date: %', date(assign_lesson_starttime);

raise notice 'lesson t-2h check: %',(assign_lesson_starttime - now() ) > '2hour'::interval;

-- check req time and act accordingly

raise notice '_reqtype: %', _reqtype;

if _reqtype ='client_req' then

	if (assign_lesson_starttime < now() ) then
	-- not allow to change past lesson.
	raise notice 'cant change past lesson';
	return (false, false, 'can not change past lesson'::text);
		
	elsif (assign_lesson_starttime - now() ) < '2hour'::interval then
	-- critical client req cancel
	raise notice 'critical client req cancel';


	if _force_penalty=true then
	-- cancel lesson 
		UPDATE lesson SET canceled_time = now(), cancel_type = 'CRITICAL_CLIENT_REQUEST' where lesson.id = assign_lesson_id RETURNING 1 INTO assign_delete_or_update_done;

		if assign_delete_or_update_done != true then
		return (false, false, 'failed to update'::text);
		else
		return (true, false, null::text);
		end if;

	else
	raise notice 'abort since force_penalty: %', _force_penalty;
	return (false, true, null::text);
	end if;

	elsif now() > date(assign_lesson_starttime) then
	-- emergency client req cancel
	raise notice 'emergency client req cancel';
	UPDATE assign_ticket SET canceled_time = now(), cancel_type = 'CLIENT_REQUEST' where assign_ticket.id = assign_id RETURNING 1 into assign_delete_or_update_done;

	else
	-- safe client req cancel
	raise notice 'safe client req cancel';
	DELETE FROM assign_ticket where assign_ticket.id = assign_id RETURNING true into assign_delete_or_update_done;
	end if;


	raise notice 'assign_delete_or_update_done: %',assign_delete_or_update_done;

	if assign_delete_or_update_done != true then
	return (false, false, 'update or delete fail'::text);
	end if;


elsif _reqtype = 'admin' then

	-- with admin, force cancel assign and lesson with admin cancel type
	
	UPDATE assign_ticket SET canceled_time = now(), cancel_type = 'ADMIN' where assign_ticket.id = assign_id RETURNING 1 into assign_delete_or_update_done;
	
	if assign_delete_or_update_done = false then
	return (false, false, 'admin assign ticket cancel failed'::text);
	end if;
	assign_delete_or_update_done := false;
	UPDATE lesson SET canceled_time = now(), cancel_type = 'ADMIN' where lesson.id = assign_lesson_id RETURNING 1 INTO assign_delete_or_update_done;
	
	if assign_delete_or_update_done = false then
	return (false, false, 'admin lesson cancel failed'::text);
	end if;
	
	

else
return (false, false, 'invalid reqtype'::text);
end if;



--raise exception 'debug';



RETURN (true, false, null::text);

END;
$$;


ALTER FUNCTION public.cancel_individual_lesson(_lessonid integer, _clientid integer, _reqtype character varying, _force_penalty boolean) OWNER TO postgres;

--
-- Name: cancel_lesson_with_reqtype(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cancel_lesson_with_reqtype(_lessonid integer, _reqtype text) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
tempint int;
tempbool bool;

BEGIN


-- check lessonid valid

select count(*) =1 into tempbool from lesson where lesson.id = _lessonid;

if tempbool = false then

return (false, 'lessonid invalid'::text);
end if;


-- check request time.


-- first check if current time is not after lesson start time

if _reqtype != 'admin_req' then

	select now() < starttime into tempbool from lesson where lesson.id = _lessonid;

	if tempbool = false then
	return (false, 'cancel req time after lesson starttime'::text);
	end if;

end if;

-- if safe time gap, then delete lesson row
select now() < ((starttime::date - interval '1day') + time '21:00')  into tempbool from lesson where lesson.id = _lessonid;

if tempbool = true then
-- safe time gap ensured.
-- delete row allowed.

	delete from lesson where lesson.id = _lessonid;

else

-- is not safe time gap. set cancel time with appropriate cancel type
	if _reqtype = 'instructor_req' then
	
	update lesson set cancel_type = 'INSTRUCTOR_REQUEST', canceled_time=now() where lesson.id = _lessonid;
	
	elsif _reqtype = 'admin_req' then
	
	update lesson set cancel_type = 'ADMIN', canceled_time=now() where lesson.id = _lessonid;
	
	else 
	
	raise exception 'invalid _reqtype: %', _reqtype;
	
	end if;
	
	-- update connected assig ticket rows for both lesson canceled due to instructor req and admin, since client has no fault
	update assign_ticket set canceled_time = now(), cancel_type='LESSON_CANCEL' where lessonid = _lessonid AND canceled_time is null;

end if;
	

return (true, null::text);
END;
$$;


ALTER FUNCTION public.cancel_lesson_with_reqtype(_lessonid integer, _reqtype text) OWNER TO postgres;

--
-- Name: change_lesson_time_or_instructor(integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_lesson_time_or_instructor(_lessonid integer, _instructorid integer, _new_starttime integer, _new_endtime integer) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
lesson_valid_check boolean := false;
new_instructor_valid boolean :=false;
new_starttime_is_future_check boolean := false;
update_id int := null;
involved_client_id_arr int[] := null;
involved_instructor_id int := null;
instructor_timeoverlap_exist_check boolean :=false;
clients_timeoverlap_exist_check boolean :=false;
BEGIN

-- check new starttime is not past

-- SELECT to_timestamp(_new_starttime) > now() into new_starttime_is_future_check;

-- if new_starttime_is_future_check = false then
-- return false;
-- end if;


-- check new instructor is valid

select count(1) > 0 into new_instructor_valid from instructor where instructor.id = _instructorid;

if new_instructor_valid = false then
return (false, 'invalid instructor'::text);
end if;



-- check lesson valid

SELECT count(1) > 0 into lesson_valid_check from lesson where lesson.id = _lessonid;

if lesson_valid_check = false then
return (false, 'invalid lesson'::text);
end if;


-- check related people have no overlapping lesson in new timespan

-- get instructor and involved clients to given lessonid

WITH A AS (select DISTINCT ON(plan.clientid) 
assign_ticket.id, 
assign_ticket.lessonid, lesson.instructorid, 
plan.clientid as clientid
from assign_ticket
left join lesson on assign_ticket.lessonid = lesson.id
left join ticket on assign_ticket.ticketid = ticket.id
left join plan on ticket.creator_plan_id = plan.id
where assign_ticket.lessonid=_lessonid
AND assign_ticket.canceled_time is null
ORDER BY plan.clientid, assign_ticket.created desc)
select array_agg(clientid) , (array_agg(instructorid))[1] into involved_client_id_arr, involved_instructor_id from A;

assert involved_client_id_arr is not null ,'involved_client_id_arr is null';
assert involved_instructor_id is not null , 'involved_instructor_id is null';

raise notice 'involved_client_id_arr: %', involved_client_id_arr;
raise notice 'involved_instructor_id: %',involved_instructor_id;

-- check time overlap of instructor

WITH A AS (select 
lesson.id as lessonid,
lesson.instructorid,
lesson.starttime,
lesson.endtime,
lesson.canceled_time,
count(1) filter (where assign_ticket.canceled_time is  null) >0 as valid_assign_exist
from lesson
left join assign_ticket on lesson.id = assign_ticket.lessonid
GROUP BY lesson.id)

select count(*) > 0 into instructor_timeoverlap_exist_check from A
where A.instructorid = _instructorid
AND A.valid_assign_exist is true
AND tstzrange(to_timestamp(_new_starttime), to_timestamp(_new_endtime)) && tstzrange(A.starttime, A.endtime)
AND A.lessonid != _lessonid 
AND A.canceled_time is null;

raise notice 'instructor_timeoverlap_exist_check: %', instructor_timeoverlap_exist_check;

assert instructor_timeoverlap_exist_check = false, 'instructor_timeoverlap_exist_check is not false';

if instructor_timeoverlap_exist_check=true then
return (false, 'instructor time overlap exist'::text);
end if;

-- check time overlap of clients

WITH A as (
select unnest(involved_client_id_arr) as given_client_id
)
select
count(*) >0 into clients_timeoverlap_exist_check
from A
left join plan on plan.clientid = A.given_client_id
left join ticket on ticket.creator_plan_id = plan.id
inner join assign_ticket on ticket.id = assign_ticket.ticketid
left join lesson on assign_ticket.lessonid = lesson.id
where assign_ticket.lessonid != _lessonid
AND assign_ticket.canceled_time is null
AND lesson.canceled_time is null
AND tstzrange(to_timestamp(_new_starttime), to_timestamp(_new_endtime)) && tstzrange(lesson.starttime, lesson.endtime);


raise notice 'clients_timeoverlap_exist_check: %', clients_timeoverlap_exist_check;

assert clients_timeoverlap_exist_check = false, 'clients_timeoverlap_exist_check is not false';


if clients_timeoverlap_exist_check = true then
return (false, 'client timeoverlap exist'::text);
end if;





update lesson set instructorid=_instructorid, starttime=to_timestamp(_new_starttime), endtime = to_timestamp(_new_endtime) where lesson.id = _lessonid returning lesson.id into update_id;

raise notice 'update_id: %', update_id;

if update_id is null then
return (false, 'update id is null'::text);
end if;





--RAISE EXCEPTION 'DEBUG';

RETURN (true, null::text);
END;

$$;


ALTER FUNCTION public.change_lesson_time_or_instructor(_lessonid integer, _instructorid integer, _new_starttime integer, _new_endtime integer) OWNER TO postgres;

--
-- Name: change_tickets_of_lesson(integer[], integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.change_tickets_of_lesson(_ticket_arr integer[], _lessonid integer) RETURNS record
    LANGUAGE plpgsql
    AS $$DECLARE

declare
tempbool bool;
tempbool2 bool;
tempint int;
add_ticket_id_arr int[];
remove_assign_ticket_id_arr int[];
timegap interval;
begin

-- check lesson exists and lesson start time is not past
tempbool:= null;
select starttime > now() into tempbool from lesson where lesson.id = _lessonid;

if tempbool is null then
return (false, 'lessonid invalid'::text);
elsif tempbool = false then
return (false, 'lesson start time is past'::text);
end if;

raise notice 'lesson check done';

-- check tickets are valid
select total_count=valid_count into tempbool from ( select count(*) as total_count, count(1) filter(where B.ticketid is not null) as valid_count
from (select *, ticket.id as ticketid from (select unnest(_ticket_arr) as given_id) as A
left join ticket on ticket.id = A.given_id) as B ) as C ;

if tempbool = false then
return (false, 'invalid ticket exist'::text);
end if;


-- find tickets that need to be added 
WITH B AS (select A.ticketid from lesson
inner join (select DISTINCT ON (ticketid) * from assign_ticket order by ticketid, created desc) as A on A.lessonid = lesson.id
where lesson.id = _lessonid 
and A.canceled_time is null 
)

select array_agg(unnest) , count(unnest)>0 into add_ticket_id_arr,tempbool
 from unnest(_ticket_arr)
left join B on B.ticketid = unnest
where ticketid is null ;


raise notice 'add_ticket_id_arr: %',add_ticket_id_arr;


if tempbool = true then

-- make assignments
insert into assign_ticket (ticketid, lessonid, created) select unnest, _lessonid, now() from unnest(_ticket_arr); 

end if;


-- find tickets where assignment need to be canceled
-- only allow removal when in safe time gap
-- if non safe removal is detected, then return false, and error msg

WITH B AS (select A.ticketid, A.id as assign_ticket_id, lesson.starttime, now() < ( lesson.starttime::date - interval '1day' + time '21:00' ) as safe_timegap from lesson
inner join (select DISTINCT ON (ticketid) * from assign_ticket where canceled_time is null order by ticketid, created desc) as A on A.lessonid = lesson.id
where lesson.id = _lessonid )


select array_agg(B.assign_ticket_id), count(*) > 0, count(1) filter(where B.safe_timegap = false) into remove_assign_ticket_id_arr, tempbool, tempint from B
left join (select unnest(_ticket_arr)) as C on B.ticketid = C.unnest
where C.unnest is null;
 --and B.safe_timegap =true;
 -- ignore safe timegap for now....

raise notice 'remove_assign_ticket_id_arr: %', remove_assign_ticket_id_arr;

-- ignore safe timegap
--if tempint >0 then
--return (false, 'some ticket cannot be canceled. pass safe cancel time'::text);
--end if;

if tempbool = true then
update assign_ticket set canceled_time=now(), cancel_type = 'ADMIN' from (select unnest(remove_assign_ticket_id_arr)) as A where A.unnest = assign_ticket.id;
end if;

-- if no ticket idarr, then cancel lesson too
raise notice '_ticket_arr: %', _ticket_arr;

select array_length(_ticket_arr,1) into tempint;

raise notice 'array_length: %', tempint;

select array_length(_ticket_arr, 1) is null OR _ticket_arr is null into tempbool;

raise notice '_ticket_arr length is zero check: %',tempbool;

if tempbool = true then
-- based on time gap with request time - lesson start time, either delete lesson row or update lesson row with cancel
--select   now() < ((starttime::date - '1day'::interval)::timestamp with time zone + time '21:00')  into tempbool from lesson where lesson.id = _lessonid;

-- for now, think as admin's request.
tempbool := true;
raise notice 'no ticket arr, request time is safe check: %',tempbool;


if tempbool = true then
	delete from lesson where lesson.id = _lessonid;
	else
	update lesson set cancel_type = 'CRITICAL_CLIENT_REQUEST', canceled_time = now() where lesson.id = _lessonid;
	end if;

end if;




-- raise exception 'debug';

return (true, null::text);
end;
$$;


ALTER FUNCTION public.change_tickets_of_lesson(_ticket_arr integer[], _lessonid integer) OWNER TO postgres;

--
-- Name: check_and_delete_plan(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_and_delete_plan(plan_id integer) RETURNS record
    LANGUAGE plpgsql
    AS $$
declare

temp_int int;
temp_bool bool;
temp_float float;


begin

-- check plan id exists

select count(1) into temp_int from plan where plan.id = plan_id;

if temp_int != 1 then
return (false, 'invalid plan'::text);
end if;


-- check if associated tickets are okay to delete
-- if any tickets have been assigned to a lesson (cancelled or not), then this plan cannot be deleted.
-- expired tickets are okay for plan deletion.

temp_int :=null;

select count(1) into temp_int from ticket
left join (select DISTINCT ON (ticketid) * from assign_ticket order by ticketid, created desc) as A on A.ticketid = ticket.id

where creator_plan_id=plan_id
and destroyer_plan_id is null
and A.id is not null;


if temp_int != 0  then
-- there is at least one ticket that is assigned to lesson. thus, the plan is not deletable.
return (false, 'undeletable ticket exist'::text);
end if;



-- by now, all check as been done
-- delete plan.

delete from plan cascade where id=plan_id ;


return (true, null::text);




end;
$$;


ALTER FUNCTION public.check_and_delete_plan(plan_id integer) OWNER TO postgres;

--
-- Name: create_lesson(integer[], integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_lesson(_ticketid_arr integer[], _instructor_id integer, _starttime integer, _endtime integer) RETURNS record
    LANGUAGE plpgsql
    AS $$DECLARE
tickets_valid_check bool := false;
temp_count int :=0;
temp_check bool :=false;
ticket_client_arr integer[];
time_overlap_exist bool := false;
lesson_activity_type activity_type := null;
lesson_grouping_type grouping_type := null;
ticket_unique_count integer :=0;
created_lesson_id integer := null;

BEGIN



-- check instructor valid
temp_count:=0;
select count(1) into temp_count from instructor where instructor.id = _instructor_id;

if temp_count != 1 then
return (false, 'instructor check fail'::text);
end if;


-- check instructor time overlap
temp_check := false;
WITH B AS (select  lesson.id, lesson.instructorid, count(1) filter (where A.canceled_time is null) > 0 as tickets_alive, 
lesson.canceled_time is null as lesson_not_canceled
from lesson
inner join (select DISTINCT ON (assign_ticket.ticketid) * from assign_ticket order by assign_ticket.ticketid, 
		   assign_ticket.created desc) as A on A.lessonid = lesson.id
where lesson.instructorid = _instructor_id
AND lesson.canceled_time is null
AND tstzrange(to_timestamp(_starttime), to_timestamp(_endtime)) && tstzrange(lesson.starttime, lesson.endtime)
group by lesson.id)

select count(1) >0 into temp_check from B 
where B.tickets_alive is true
AND B.lesson_not_canceled is true;

if temp_check =true then
return (false, 'instructor time overlap'::text);
end if;



-- check tickets are valid.
tickets_valid_check:= false;
WITH A AS (select unnest as given_id from unnest(_ticketid_arr))
select count(1) filter (where ticket.id is null) >0, count(*) >0 into tickets_valid_check, temp_check from A
left join ticket on ticket.id = A.given_id;

if temp_check = false then
return (false, 'no ticket id arr given'::text);
end if;

if tickets_valid_check = true then
return (false, 'some ticket do not exist'::text);
end if;


-- ticket check. check not consumed
tickets_valid_check:=true;
WITH B AS (WITH A AS (select unnest as given_id from unnest(_ticketid_arr))
select DISTINCT ON(ticket.id) 
case
-- consumed?
when assign_ticket.id is null then false
when assign_ticket.canceled_time is null then true
else false
end as consumed

from A
left join ticket on ticket.id = A.given_id
left join assign_ticket on ticket.id = assign_ticket.ticketid
ORDER BY ticket.id, assign_ticket.created desc)
select bool_or(consumed) into tickets_valid_check from B;

if tickets_valid_check = true then
return (false, 'consumed tickets included'::text);
end if;


-- ticket check. check activity, grouping type is identical
temp_count :=0;
WITH A AS (select unnest as given_id from unnest(_ticketid_arr))
select count(distinct (plan.activity_type, plan.grouping_type)) ,  plan.activity_type , plan.grouping_type 
into temp_count, lesson_activity_type, lesson_grouping_type
from A
left join ticket on ticket.id = A.given_id
left join plan on ticket.creator_plan_id = plan.id
group by (plan.activity_type, plan.grouping_type);


if temp_count != 1 then
return (false, 'tickets do not have same activity/grouping type'::text);
end if;

raise notice 'lesson_activity_type: %',lesson_activity_type;
raise notice 'lesson_grouping_type: %', lesson_grouping_type;


-- get involved client id arr

WITH A AS (select unnest as given_id from unnest(_ticketid_arr))
select array_agg(plan.clientid) into ticket_client_arr from A
left join ticket on ticket.id = A.given_id
left join plan on ticket.creator_plan_id = plan.id;

raise notice '_ticketid_arr: %',_ticketid_arr;

-- check time overlap of clients
temp_check:=false;
WITH B AS (WITH A AS (select unnest as given_id from unnest(array[1,2]))
select DISTINCT ON(ticket.id) ticket.id, A.given_id from A
left join plan on plan.clientid = A.given_id
left join ticket on ticket.creator_plan_id = plan.id
inner join assign_ticket on assign_ticket.ticketid = ticket.id
left join lesson on lesson.id = assign_ticket.lessonid
where assign_ticket.canceled_time is null
AND lesson.canceled_time is null
AND tstzrange(to_timestamp(_starttime), to_timestamp(_endtime)) && tstzrange(lesson.starttime, lesson.endtime)
order by ticket.id, assign_ticket.created desc)
select count(1) >0 into temp_check  from B;

if temp_check = true then
return (false, 'client time overlap'::text);
end if;



-- create lesson

insert into lesson (instructorid, starttime, endtime, created, activity_type, grouping_type) values (_instructor_id, to_timestamp(_starttime), to_timestamp(_endtime), now(), lesson_activity_type, lesson_grouping_type) RETURNING lesson.id into created_lesson_id;

raise notice 'created_lesson_id: %', created_lesson_id;

if created_lesson_id is null then
RETURN (false, 'failed to create lesson'::text);
end if;

-- create assign_ticket rows
temp_count:=null;
with A as (insert into assign_ticket (ticketid, lessonid, created) (SELECT unnest(_ticketid_arr), created_lesson_id, now()) RETURNING 1 )
select count(1) into temp_count from A;

if temp_count is null then
return (false, 'creating assign ticket failed'::text);
end if;


RETURN (true, null::text);

END;

$$;


ALTER FUNCTION public.create_lesson(_ticketid_arr integer[], _instructor_id integer, _starttime integer, _endtime integer) OWNER TO postgres;

--
-- Name: create_plan_and_tickets(integer, integer, integer, public.activity_type, public.grouping_type, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_plan_and_tickets(_clientid integer, _rounds integer, _total_cost integer, _activity_type public.activity_type, _grouping_type public.grouping_type, _backed_coupon character varying DEFAULT NULL::character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
plan_created bool := false;
created_plan_id integer:=null;


BEGIN

	insert into plan (clientid, rounds, totalcost, activity_type, grouping_type, coupon_backed) values 
	(_clientid, _rounds, _total_cost, _activity_type, _grouping_type, _backed_coupon) RETURNING id into created_plan_id;
	
	raise notice 'plan_created: %', plan_created;
	raise notice 'created_plan_id: %', created_plan_id;
	
	
	if created_plan_id is null then
	
	RETURN false;
	end if;
	
	
	insert into ticket (expire_time, creator_plan_id) select now() + '1 month'::interval, created_plan_id from generate_series(1, _rounds); 
	
RETURN true;
END;
$$;


ALTER FUNCTION public.create_plan_and_tickets(_clientid integer, _rounds integer, _total_cost integer, _activity_type public.activity_type, _grouping_type public.grouping_type, _backed_coupon character varying) OWNER TO postgres;

--
-- Name: create_plan_and_tickets(integer, integer, integer, public.activity_type, public.grouping_type, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_plan_and_tickets(_clientid integer, _rounds integer, _total_cost integer, _activity_type public.activity_type, _grouping_type public.grouping_type, _backed_coupon text, _expiretime timestamp with time zone) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
plan_created bool := false;
created_plan_id integer:=null;
tempbool bool;

BEGIN



-- check expiretime is later than current time
select _expiretime > now() into tempbool;

if tempbool = false then
return (false, 'expiretime is before now'::text);
end if;


insert into plan (clientid, rounds, totalcost, activity_type, grouping_type, coupon_backed) values
(_clientid, _rounds, _total_cost, _activity_type, _grouping_type, _backed_coupon) RETURNING id into created_plan_id;

raise notice 'plan_created: %', plan_created;
raise notice 'created_plan_id: %', created_plan_id;


if created_plan_id is null then

RETURN (false, 'failed to create plan'::text);
end if;


insert into ticket (expire_time, creator_plan_id) select _expiretime, created_plan_id from generate_series(1, _rounds);

RETURN (true, null::text);
END;
$$;


ALTER FUNCTION public.create_plan_and_tickets(_clientid integer, _rounds integer, _total_cost integer, _activity_type public.activity_type, _grouping_type public.grouping_type, _backed_coupon text, _expiretime timestamp with time zone) OWNER TO postgres;

--
-- Name: delete_tickets(integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_tickets(ticket_id_arr integer[]) RETURNS record
    LANGUAGE plpgsql
    AS $$
declare

temp_int int;
temp_bool bool;
temp_float float;

begin

-- check ticket id arr are all valid


with A as (select * from unnest(ticket_id_arr) as given_id)
select count(1) filter(where ticket.id is null) 
into temp_int
from A 
left join ticket on ticket.id = A.given_id;


if temp_int >0 then
return (false, 'invalid ticket id exist'::text);
end if;

-- check tickets are deletable.
-- this means, it should NOT be consumed and NOT expired.


-- first check expired
with A as (select * from unnest(ticket_id_arr) as given_id)

select count(1) filter(where now() > ticket.expire_time )
into temp_int
from A
left join ticket on ticket.id = A.given_id;


if temp_int > 0 then
	return (false, 'expired ticket exist'::text);
end if;


-- check not consumed
-- this can be done by checking latest ticket_assign for ticket id.
-- if there is no assign ticket item, then it is not consumed.
-- if there is an assign ticket item, get latest item. if that is canceled, then it is not consumed.
-- if latest assignt ticket item is not cancelled, then check related lesson. if that lesson is cancelled, then it is not consumed.
-- in all other cases, think as consumed.

-- we need to check if any of the tickets are consumed.
-- then we need to check for condition: 
-- 1) ticket assign item exist
-- 2) that ticket assign is not cancelled
-- 3) that ticket assign item's related lesson is not cancelled

with A as (select * from unnest(ticket_id_arr) as given_id)

select count(1) filter(where B.id is not null AND B.canceled_time is null AND lesson.canceled_time is null) 
into temp_int
from A
left join ticket on ticket.id = A.given_id
left join (select DISTINCT ON(ticketid) * from assign_ticket order by ticketid, created desc) as B on B.ticketid = ticket.id
left join lesson on lesson.id = B.lessonid;

if temp_int >0 then
	return (false, 'consumed ticket id exist'::text);
end if;


-- by now, all ticket ids are valid for deletion.
-- when deleting, we need to adjust plan info as well, in order to retain
-- per ticket cost.



with B as (
with A as (select * from unnest(ticket_id_arr) as given_id)

select count(1) as del_ticket_count, creator_plan_id, sum(B.per_ticket_cost) as reduce_cost,
(array_agg(B.totalcost))[1] - sum(B.per_ticket_cost) as new_totalcost,
(array_agg(B.rounds))[1] - count(1) as new_rounds,
( (array_agg(B.rounds))[1] - count(1) ) > 0 as new_rounds_remain_bool,
	array_agg(A.given_id) as ticket_id_list
from A
left join ticket on ticket.id = A.given_id
left join (select id, totalcost,rounds, totalcost/rounds as per_ticket_cost from plan) as B on ticket.creator_plan_id = B.id
group by creator_plan_id

)


update plan set totalcost = B.new_totalcost, rounds=B.new_rounds
from B where plan.id = B.creator_plan_id;


-- delete the tickets

delete from ticket where id in (select givenid from unnest(ticket_id_arr) as givenid);


return (true, null::text);




end;
$$;


ALTER FUNCTION public.delete_tickets(ticket_id_arr integer[]) OWNER TO postgres;

--
-- Name: transfer_tickets(integer[], integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.transfer_tickets(_ticket_id_arr integer[], _clientid integer) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
client_check bool :=false;
ticket_id_arr_valid bool :=false;
check_row RECORD;
plan_count int := null;
prev_plan_activity_type activity_type := null;
prev_plan_grouping_type grouping_type := null;
new_plan_id int :=null;
new_plan_total_cost int :=null;
new_plan_total_rounds int :=null;



BEGIN

-- check client id is valid
select count(1) =1 into client_check from client where client.id = _clientid;

raise notice 'client_check: %',client_check;

IF client_check = false then
return (false, 'invalid client'::text);
end if;

-- check if ticket id exist

WITH A AS (select unnest as given_id from unnest(_ticket_id_arr))
select count(1) filter (where ticket.id is null) = 0  into ticket_id_arr_valid from A
left join ticket on A.given_id = ticket.id;

raise notice 'ticket_id_arr_valid: %', ticket_id_arr_valid;

IF ticket_id_arr_valid = false then
return (false, 'invalid ticket exist'::text);
end if;

-- check and extract identical plan id, activty type, grouping type of tickets

WITH B AS (
WITH A as 
	(select unnest as given_id from unnest(_ticket_id_arr))
select  plan.id, plan.activity_type, plan.grouping_type ,
sum(plan.totalcost / plan.rounds) as total_cost,
count(1) as rounds
from A
left join ticket on ticket.id = A.given_id
left join plan on ticket.creator_plan_id = plan.id
group by plan.id
	)
	select count(id) , (array_agg(B.activity_type))[1], (array_agg(B.grouping_type))[1], (array_agg(B.total_cost))[1], (array_agg(B.rounds))[1] into
	plan_count, prev_plan_activity_type, prev_plan_grouping_type, new_plan_total_cost, new_plan_total_rounds
	from B ;

	
raise notice 'plan_count: %',plan_count;
raise notice 'prev_plan_activity_type: %',prev_plan_activity_type;
raise notice 'prev_plan_grouping_type: %',prev_plan_grouping_type;
raise notice 'new_plan_total_cost: %', new_plan_total_cost;
raise notice 'new_plan_total_rounds: %', new_plan_total_rounds;


if plan_count=0 or plan_count>1 then
return (false, 'plan is none or more than one'::text);
end if;

assert new_plan_total_cost is not null, 'total cost is null';
assert new_plan_total_rounds is not null, 'total rounds is null';


-- create new plan
insert into plan (clientid, rounds, totalcost, activity_type, grouping_type) values (_clientid, new_plan_total_rounds, new_plan_total_cost, prev_plan_activity_type, prev_plan_grouping_type)
returning plan.id into new_plan_id;

raise notice 'new_plan_id: %', new_plan_id;

assert new_plan_id is not null ,'new_plan_id is null';

-- create new tickets

WITH B AS (
	WITH A as (select unnest(_ticket_id_arr) as given_id)
select ticket.expire_time, new_plan_id as creator_plan_id from A
left join ticket on A.given_id = ticket.id
	)
	insert into ticket (expire_time, creator_plan_id) (select * from B) ;

-- update prev tickets' destroyer plan id
update ticket set destroyer_plan_id = creator_plan_id where ticket.id in (select(unnest(_ticket_id_arr)));


--RAISE EXCEPTION 'debug';

RETURN (true, null::text);


END;
$$;


ALTER FUNCTION public.transfer_tickets(_ticket_id_arr integer[], _clientid integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assign_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assign_ticket (
    id integer NOT NULL,
    ticketid integer NOT NULL,
    lessonid integer NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    canceled_time timestamp with time zone,
    cancel_type public.ticket_assign_cancel_type
);


ALTER TABLE public.assign_ticket OWNER TO postgres;

--
-- Name: assign_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assign_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.assign_ticket_id_seq OWNER TO postgres;

--
-- Name: assign_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assign_ticket_id_seq OWNED BY public.assign_ticket.id;


--
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    phonenumber character varying(20) NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    job character varying(30),
    email character varying(50),
    birthdate timestamp with time zone,
    address character varying(50),
    memo text,
    gender public.gender,
    disabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- Name: client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.client_id_seq OWNER TO postgres;

--
-- Name: client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_id_seq OWNED BY public.client.id;


--
-- Name: instructor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    phonenumber character varying(20),
    created timestamp with time zone DEFAULT now() NOT NULL,
    gender public.gender,
    birthdate timestamp with time zone,
    address character varying(100),
    email character varying(50),
    job character varying(20),
    validation_date timestamp with time zone,
    is_apprentice boolean,
    level integer,
    memo text,
    disabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.instructor OWNER TO postgres;

--
-- Name: instructor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instructor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.instructor_id_seq OWNER TO postgres;

--
-- Name: instructor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instructor_id_seq OWNED BY public.instructor.id;


--
-- Name: instructor_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_level (
    id integer NOT NULL,
    level_string text NOT NULL,
    active boolean NOT NULL
);


ALTER TABLE public.instructor_level OWNER TO postgres;

--
-- Name: instructor_level_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instructor_level_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.instructor_level_id_seq OWNER TO postgres;

--
-- Name: instructor_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instructor_level_id_seq OWNED BY public.instructor_level.id;


--
-- Name: lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson (
    id integer NOT NULL,
    instructorid integer NOT NULL,
    starttime timestamp with time zone NOT NULL,
    endtime timestamp with time zone NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    cancel_type public.lesson_cancel_type,
    predecessor_id integer,
    canceled_time timestamp with time zone,
    activity_type public.activity_type NOT NULL,
    grouping_type public.grouping_type NOT NULL
);


ALTER TABLE public.lesson OWNER TO postgres;

--
-- Name: lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lesson_id_seq OWNER TO postgres;

--
-- Name: lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_id_seq OWNED BY public.lesson.id;


--
-- Name: plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plan (
    id integer NOT NULL,
    clientid integer NOT NULL,
    rounds integer NOT NULL,
    totalcost integer NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    activity_type public.activity_type NOT NULL,
    grouping_type public.grouping_type NOT NULL,
    coupon_backed character varying(50) DEFAULT NULL::character varying,
    transferred_from_subscription_id integer
);


ALTER TABLE public.plan OWNER TO postgres;

--
-- Name: plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plan_id_seq OWNER TO postgres;

--
-- Name: plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plan_id_seq OWNED BY public.plan.id;


--
-- Name: ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket (
    id integer NOT NULL,
    expire_time timestamp with time zone NOT NULL,
    creator_plan_id integer NOT NULL,
    destroyer_plan_id integer
);


ALTER TABLE public.ticket OWNER TO postgres;

--
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_id_seq OWNER TO postgres;

--
-- Name: ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_id_seq OWNED BY public.ticket.id;


--
-- Name: assign_ticket id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assign_ticket ALTER COLUMN id SET DEFAULT nextval('public.assign_ticket_id_seq'::regclass);


--
-- Name: client id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client ALTER COLUMN id SET DEFAULT nextval('public.client_id_seq'::regclass);


--
-- Name: instructor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor ALTER COLUMN id SET DEFAULT nextval('public.instructor_id_seq'::regclass);


--
-- Name: instructor_level id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_level ALTER COLUMN id SET DEFAULT nextval('public.instructor_level_id_seq'::regclass);


--
-- Name: lesson id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson ALTER COLUMN id SET DEFAULT nextval('public.lesson_id_seq'::regclass);


--
-- Name: plan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan ALTER COLUMN id SET DEFAULT nextval('public.plan_id_seq'::regclass);


--
-- Name: ticket id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket ALTER COLUMN id SET DEFAULT nextval('public.ticket_id_seq'::regclass);


--
-- Name: assign_ticket assign_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assign_ticket
    ADD CONSTRAINT assign_ticket_pkey PRIMARY KEY (id);


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- Name: client client_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_unique UNIQUE (name, phonenumber);


--
-- Name: instructor_level instructor_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_level
    ADD CONSTRAINT instructor_level_pkey PRIMARY KEY (id);


--
-- Name: instructor instructor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT instructor_pkey PRIMARY KEY (id);


--
-- Name: instructor instructor_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT instructor_unique UNIQUE (name, phonenumber);


--
-- Name: lesson lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson
    ADD CONSTRAINT lesson_pkey PRIMARY KEY (id);


--
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (id);


--
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (id);


--
-- Name: assign_ticket assign_ticket_lessonid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assign_ticket
    ADD CONSTRAINT assign_ticket_lessonid_fkey FOREIGN KEY (lessonid) REFERENCES public.lesson(id) ON DELETE CASCADE;


--
-- Name: assign_ticket assign_ticket_ticketid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assign_ticket
    ADD CONSTRAINT assign_ticket_ticketid_fkey FOREIGN KEY (ticketid) REFERENCES public.ticket(id);


--
-- Name: plan fk_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT fk_client FOREIGN KEY (clientid) REFERENCES public.client(id);


--
-- Name: ticket fk_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT fk_creator FOREIGN KEY (creator_plan_id) REFERENCES public.plan(id);


--
-- Name: ticket fk_destroyer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT fk_destroyer FOREIGN KEY (destroyer_plan_id) REFERENCES public.plan(id);


--
-- Name: instructor fk_level; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor
    ADD CONSTRAINT fk_level FOREIGN KEY (level) REFERENCES public.instructor_level(id);


--
-- Name: lesson lesson_instructorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson
    ADD CONSTRAINT lesson_instructorid_fkey FOREIGN KEY (instructorid) REFERENCES public.instructor(id);


--
-- PostgreSQL database dump complete
--

